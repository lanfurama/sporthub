import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, BookingStatus, BookingSource, CourtStatus, CreditTxType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, type AuthContext } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';
import { generateRef, checkSlotAvailable, calcPrice } from '@/src/lib/booking-helpers';

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

function tryGetAuthContext(req: NextRequest): AuthContext | null {
  try {
    return getAuthContext(req);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = BookingSchema.parse(body);
    const ctx = tryGetAuthContext(req); // anonymous booking allowed

    const court = await prisma.court.findFirst({
      where: { id: data.courtId, status: CourtStatus.active },
    });
    if (!court) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sân');

    const available = await checkSlotAvailable(
      data.courtId,
      data.date,
      data.time,
      data.duration,
    );
    if (!available) {
      throw new AppError(
        409,
        'SLOT_NOT_AVAILABLE',
        `Khung giờ ${data.time} ngày ${data.date} của ${court.name} đã được đặt`,
      );
    }

    let membership = null;
    if (data.memberId) {
      membership = await prisma.membership.findFirst({
        where: { id: data.memberId, status: 'active' },
        include: { planConfig: true },
      });
      if (!membership) {
        throw new AppError(404, 'MEMBERSHIP_NOT_FOUND', 'Không tìm thấy gói thành viên active');
      }
    }

    if (data.useGuestPass) {
      if (!membership) {
        throw new AppError(400, 'NO_MEMBERSHIP', 'Cần có gói thành viên để dùng guest pass');
      }
      if (membership.guestPasses <= 0) {
        throw new AppError(400, 'NO_GUEST_PASSES', 'Không còn guest pass');
      }
    }

    const pricing = await calcPrice(
      court,
      data.time,
      data.duration,
      membership,
      data.creditAmount,
    );

    let ref = generateRef();
    while (await prisma.booking.findUnique({ where: { ref } })) ref = generateRef();

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          ref,
          courtId: data.courtId,
          customerId: ctx?.userId ?? null,
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

    // TODO Phase 4: replace with polling-based slot updates (was emitSlotLocked + emitBookingCreated)
    // TODO Phase 9: port email confirmation (server/src/lib/email.ts not ported yet)

    return ok(
      {
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
      201,
    );
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = getAuthContext(req); // require auth for listing

    const status = req.nextUrl.searchParams.get('status');
    const date = req.nextUrl.searchParams.get('date');
    const source = req.nextUrl.searchParams.get('source');
    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10);
    const skip = (page - 1) * limit;

    // Customer scope only — filter to own bookings. Admin scope is Phase 3.
    const where: Prisma.BookingWhereInput = { customerId: ctx.userId };

    if (status) {
      const statusMap: Record<string, BookingStatus> = {
        pending: BookingStatus.pending,
        confirmed: BookingStatus.confirmed,
        rejected: BookingStatus.rejected,
        cancelled: BookingStatus.cancelled,
        completed: BookingStatus.completed,
      };
      if (statusMap[status]) where.status = statusMap[status];
    }
    if (date) where.bookingDate = new Date(date);
    if (source) {
      const sourceMap: Record<string, BookingSource> = {
        online: BookingSource.online,
        admin: BookingSource.admin,
      };
      if (sourceMap[source]) where.source = sourceMap[source];
    }

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: { court: { select: { name: true, sport: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return handleError(err);
  }
}
