import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma, BookingStatus, BookingSource, CourtStatus, CreditTxType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { sendBookingConfirmation } from '../lib/email';
import { emitBookingCreated, emitBookingConfirmed, emitSlotLocked, emitSlotReleased } from '../ws';

const BookingSchema = z.object({
  courtId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(0.5).max(8),
  customer: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^0\d{9}$/),
    email: z.string().email().optional(),
  }),
  memberId: z.string().uuid().optional(),
  useCredit: z.boolean().optional(),
  creditAmount: z.number().int().min(0).optional(),
  useGuestPass: z.boolean().optional(),
  note: z.string().optional(),
});

const AdminBookingSchema = BookingSchema.extend({
  payMethod: z.string().optional(),
});

function generateRef(): string {
  return 'SH' + Math.floor(100000 + Math.random() * 900000).toString();
}

// Parse "HH:MM" to decimal hours (e.g. "09:30" → 9.5)
function timeToDecimal(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

async function checkSlotAvailable(
  courtId: number,
  date: string,
  time: string,
  duration: number,
  excludeBookingId?: string,
): Promise<boolean> {
  const newStart = timeToDecimal(time);
  const newEnd = newStart + duration;

  const existing = await prisma.booking.findMany({
    where: {
      courtId,
      bookingDate: new Date(date),
      status: { notIn: [BookingStatus.cancelled, BookingStatus.rejected] },
      ...(excludeBookingId ? { NOT: { id: excludeBookingId } } : {}),
    },
    select: { startTime: true, durationHours: true },
  });

  return !existing.some((b) => {
    const bStart = timeToDecimal(b.startTime);
    const bEnd = bStart + parseFloat(b.durationHours.toString());
    return newStart < bEnd && newEnd > bStart;
  });
}

async function calcPrice(
  court: { priceNormal: number; pricePeak: number; peakStart: string; peakEnd: string },
  time: string,
  duration: number,
  membership: { planConfig: { courtDiscountPct: number }; creditBalance: number } | null,
  creditAmount = 0,
) {
  const hour = parseInt(time.split(':')[0]);
  const peakStart = parseInt(court.peakStart.split(':')[0]);
  const peakEnd = parseInt(court.peakEnd.split(':')[0]);
  const isPeak = hour >= peakStart && hour < peakEnd;
  const basePrice = Math.round((isPeak ? court.pricePeak : court.priceNormal) * duration);
  const discountPct = membership?.planConfig.courtDiscountPct ?? 0;
  const discountAmount = Math.round(basePrice * discountPct / 100);
  const maxCredit = membership
    ? Math.min(creditAmount, membership.creditBalance, basePrice - discountAmount)
    : 0;
  const finalPrice = basePrice - discountAmount - maxCredit;
  return { basePrice, discountAmount, creditUsed: maxCredit, finalPrice };
}

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = BookingSchema.parse(req.body);

    // FIX: use findFirst — status is not a unique field, findUnique would throw
    const court = await prisma.court.findFirst({ where: { id: data.courtId, status: CourtStatus.active } });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');

    // Check slot availability before hitting DB constraints
    const available = await checkSlotAvailable(data.courtId, data.date, data.time, data.duration);
    if (!available) {
      throw new AppError(409, 'SLOT_NOT_AVAILABLE',
        `Khung giờ ${data.time} ngày ${data.date} của ${court.name} đã được đặt`);
    }

    let membership = null;
    if (data.memberId) {
      membership = await prisma.membership.findFirst({
        where: { id: data.memberId, status: 'active' },
        include: { planConfig: true },
      });
      if (!membership) throw new AppError(404, 'MEMBERSHIP_NOT_FOUND', 'Không tìm thấy gói thành viên active');
    }

    // Validate guest pass availability before proceeding
    if (data.useGuestPass) {
      if (!membership) throw new AppError(400, 'NO_MEMBERSHIP', 'Cần có gói thành viên để dùng guest pass');
      if (membership.guestPasses <= 0) throw new AppError(400, 'NO_GUEST_PASSES', 'Không còn guest pass');
    }

    const pricing = await calcPrice(court, data.time, data.duration, membership, data.creditAmount);

    let ref = generateRef();
    while (await prisma.booking.findUnique({ where: { ref } })) ref = generateRef();

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          ref,
          courtId: data.courtId,
          customerId: req.user?.id ?? null,
          membershipId: data.memberId ?? null,
          customerName: data.customer.name,
          customerPhone: data.customer.phone,
          bookingDate: new Date(data.date),
          startTime: data.time,
          durationHours: data.duration,
          ...pricing,
          source: BookingSource.online,
          status: BookingStatus.pending,
          note: data.note,
        },
        include: { court: { select: { name: true } } },
      });

      if (pricing.creditUsed > 0 && membership) {
        await tx.membership.update({
          where: { id: membership.id },
          data: { creditBalance: { decrement: pricing.creditUsed } },
        });
        // FIX: store positive amount — type field signals direction
        await tx.creditTransaction.create({
          data: {
            membershipId: membership.id,
            amount: pricing.creditUsed,
            type: CreditTxType.debit,
            referenceType: 'booking',
            referenceId: newBooking.id,
          },
        });
      }

      if (data.useGuestPass && membership) {
        await tx.membership.update({
          where: { id: membership.id },
          data: { guestPasses: { decrement: 1 } },
        });
        await tx.guestPassTransaction.create({
          data: {
            membershipId: membership.id,
            amount: -1,
            type: 'used',
            bookingId: newBooking.id,
          },
        });
      }

      return newBooking;
    });

    if (data.customer.email) {
      sendBookingConfirmation(
        data.customer.email,
        booking.ref,
        booking.court.name,
        data.date,
        data.time
      ).catch(err => {
        console.error('\n⚠️ [Email] Failed to send booking confirmation');
        console.error(`   Booking ID: ${booking.id}`);
        console.error(`   Error:`, err);
        console.error('');
      });
    }

    emitSlotLocked(data.courtId, data.date, data.time);

    emitBookingCreated({
      id: booking.id,
      ref: booking.ref,
      courtName: booking.court.name,
      customerName: data.customer.name,
      date: data.date,
      time: data.time,
    });

    emitSlotLocked(data.courtId, data.date, data.time);

    res.status(201).json({
      success: true,
      data: {
        id: booking.id,
        ref: booking.ref,
        status: booking.status,
        courtName: booking.court.name,
        date: data.date,
        time: data.time,
        duration: data.duration,
        pricing,
        createdAt: booking.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const data = AdminBookingSchema.parse(req.body);

    // FIX: use findFirst — status is not a unique field
    const court = await prisma.court.findFirst({ where: { id: data.courtId, status: CourtStatus.active } });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');

    const available = await checkSlotAvailable(data.courtId, data.date, data.time, data.duration);
    if (!available) {
      throw new AppError(409, 'SLOT_NOT_AVAILABLE',
        `Khung giờ ${data.time} ngày ${data.date} của ${court.name} đã được đặt`);
    }

    let membership = null;
    if (data.memberId) {
      membership = await prisma.membership.findFirst({
        where: { id: data.memberId, status: 'active' },
        include: { planConfig: true },
      });
    }

    const pricing = await calcPrice(court, data.time, data.duration, membership, data.creditAmount);

    let ref = generateRef();
    while (await prisma.booking.findUnique({ where: { ref } })) ref = generateRef();

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          ref,
          courtId: data.courtId,
          customerId: req.user?.id ?? null,
          membershipId: data.memberId ?? null,
          customerName: data.customer.name,
          customerPhone: data.customer.phone,
          bookingDate: new Date(data.date),
          startTime: data.time,
          durationHours: data.duration,
          ...pricing,
          payMethod: data.payMethod,
          source: BookingSource.admin,
          status: BookingStatus.confirmed,
          note: data.note,
        },
        include: { court: { select: { name: true } } },
      });

      if (pricing.creditUsed > 0 && membership) {
        await tx.membership.update({
          where: { id: membership.id },
          data: { creditBalance: { decrement: pricing.creditUsed } },
        });
        await tx.creditTransaction.create({
          data: {
            membershipId: membership.id,
            amount: pricing.creditUsed,
            type: CreditTxType.debit,
            referenceType: 'booking',
            referenceId: newBooking.id,
          },
        });
      }

      return newBooking;
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, date, source, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const isAdmin = req.user && ['staff', 'admin', 'super_admin'].includes(req.user.role);

    const where: Prisma.BookingWhereInput = {};
    if (!isAdmin) where.customerId = req.user?.id;
    if (status) {
      const statusMap: Record<string, BookingStatus> = {
        'pending': BookingStatus.pending,
        'confirmed': BookingStatus.confirmed,
        'rejected': BookingStatus.rejected,
        'cancelled': BookingStatus.cancelled,
        'completed': BookingStatus.completed,
      };
      if (statusMap[status as string]) {
        where.status = statusMap[status as string];
      }
    }
    if (date) where.bookingDate = new Date(date as string);
    if (source) {
      const sourceMap: Record<string, BookingSource> = {
        'online': BookingSource.online,
        'admin': BookingSource.admin,
      };
      if (sourceMap[source as string]) {
        where.source = sourceMap[source as string];
      }
    }

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: { court: { select: { name: true, sport: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      meta: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { court: true },
    });
    if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đặt sân');

    // Non-admin can only see their own bookings
    const isAdmin = req.user && ['staff', 'admin', 'super_admin'].includes(req.user.role);
    if (!isAdmin && booking.customerId !== req.user?.id) {
      throw new AppError(403, 'FORBIDDEN', 'Không có quyền truy cập');
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, reason } = z.object({
      status: z.enum([BookingStatus.confirmed, BookingStatus.rejected, BookingStatus.completed] as [BookingStatus, ...BookingStatus[]]),
      reason: z.string().optional(),
    }).parse(req.body);

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đặt sân');

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status, ...(reason ? { cancelReason: reason } : {}) },
      include: { 
        court: { select: { name: true } },
        customer: { select: { email: true } },
      },
    });

    if (status === BookingStatus.confirmed && updated.customer?.email) {
      sendBookingConfirmation(
        updated.customer.email,
        updated.ref,
        updated.court.name,
        updated.bookingDate.toISOString().split('T')[0],
        updated.startTime
      ).catch(err => {
        console.error('\n⚠️ [Email] Failed to send booking confirmation');
        console.error(`   Booking ID: ${booking.id}`);
        console.error(`   Error:`, err);
        console.error('');
      });
      
      emitBookingConfirmed(updated.id, updated.ref, updated.customerId || undefined);
    }

    res.json({ success: true, data: { id: updated.id, status: updated.status } });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { 
        court: { select: { id: true } },
        membership: true,
      },
    });
    if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đặt sân');

    // Guard: cannot cancel an already-terminal booking
    const terminalStatuses: BookingStatus[] = [BookingStatus.cancelled, BookingStatus.rejected, BookingStatus.completed];
    if (terminalStatuses.includes(booking.status as BookingStatus)) {
      throw new AppError(400, 'INVALID_STATUS', `Không thể hủy đặt sân có trạng thái "${booking.status}"`);
    }

    const isAdmin = req.user && ['staff', 'admin', 'super_admin'].includes(req.user.role);
    if (!isAdmin) {
      if (booking.customerId !== req.user?.id) {
        throw new AppError(403, 'FORBIDDEN', 'Không có quyền hủy đặt sân này');
      }
      // Customers can only cancel >= 2 hours before start
      const bookingDateTime = new Date(`${booking.bookingDate.toISOString().split('T')[0]}T${booking.startTime}:00`);
      const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
      if (new Date() > twoHoursBefore) {
        throw new AppError(400, 'CANCEL_TOO_LATE', 'Không thể hủy trong vòng 2 giờ trước khi chơi');
      }
    }

    let refunded = 0;

    await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.cancelled, cancelledAt: new Date() },
      });

      emitSlotReleased(booking.court.id, booking.bookingDate.toISOString().split('T')[0], booking.startTime);

      if (booking.creditUsed > 0 && booking.membershipId) {
        refunded = Number(booking.creditUsed);
        await tx.membership.update({
          where: { id: booking.membershipId },
          data: { creditBalance: { increment: refunded } },
        });
        await tx.creditTransaction.create({
          data: {
            membershipId: booking.membershipId,
            amount: refunded,
            type: CreditTxType.credit,
            referenceType: 'booking_cancel',
            referenceId: booking.id,
          },
        });
      }
    });

    res.json({ success: true, data: { refunded, refundType: refunded > 0 ? 'credit' : 'none' } });
  } catch (err) {
    next(err);
  }
}
