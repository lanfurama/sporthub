import { NextRequest } from 'next/server';
import { BookingStatus, CreditTxType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { court: true },
    });
    if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đặt sân');

    const isAdmin = ['staff', 'admin', 'super_admin'].includes(ctx.role);
    if (!isAdmin && booking.customerId !== ctx.userId) {
      throw new AppError(403, 'FORBIDDEN', 'Không có quyền truy cập');
    }

    return ok(booking);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { court: { select: { id: true } }, membership: true },
    });
    if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đặt sân');

    const terminalStatuses: BookingStatus[] = [
      BookingStatus.cancelled,
      BookingStatus.rejected,
      BookingStatus.completed,
    ];
    if (terminalStatuses.includes(booking.status as BookingStatus)) {
      throw new AppError(
        400,
        'INVALID_STATUS',
        `Không thể hủy đặt sân có trạng thái "${booking.status}"`,
      );
    }

    const isAdmin = ['staff', 'admin', 'super_admin'].includes(ctx.role);
    if (!isAdmin) {
      if (booking.customerId !== ctx.userId) {
        throw new AppError(403, 'FORBIDDEN', 'Không có quyền hủy đặt sân này');
      }
      const bookingDateTime = new Date(
        `${booking.bookingDate.toISOString().split('T')[0]}T${booking.startTime}:00`,
      );
      const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
      if (new Date() > twoHoursBefore) {
        throw new AppError(400, 'CANCEL_TOO_LATE', 'Không thể hủy trong vòng 2 giờ trước khi chơi');
      }
    }

    let refunded = 0;

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.cancelled, cancelledAt: new Date() },
      });

      // TODO Phase 4: replace with polling-based slot updates (was emitSlotReleased)

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

    return ok({ refunded, refundType: refunded > 0 ? 'credit' : 'none' });
  } catch (err) {
    return handleError(err);
  }
}
