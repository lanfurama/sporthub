import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BookingSource, BookingStatus, CourtStatus, CreditTxType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';
import { generateRef, checkSlotAvailable, calcPrice } from '@/src/lib/booking-helpers';

const AdminBookingSchema = z.object({
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
  payMethod: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'staff');
    const body = await req.json();
    const data = AdminBookingSchema.parse(body);

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
          customerId: ctx.userId,
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

    return ok(booking, 201);
  } catch (err) {
    return handleError(err);
  }
}
