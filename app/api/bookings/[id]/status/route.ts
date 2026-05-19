import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const StatusSchema = z.object({
  status: z.enum([
    BookingStatus.confirmed,
    BookingStatus.rejected,
    BookingStatus.completed,
  ] as [BookingStatus, ...BookingStatus[]]),
  reason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'staff');
    const { id } = await params;
    const body = await req.json();
    const { status, reason } = StatusSchema.parse(body);

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đặt sân');

    const updated = await prisma.booking.update({
      where: { id },
      data: { status, ...(reason ? { cancelReason: reason } : {}) },
      include: {
        court: { select: { name: true } },
        customer: { select: { email: true } },
      },
    });

    // TODO Phase 9: re-add email confirmation (lib/email.ts not ported yet)

    return ok({ id: updated.id, status: updated.status });
  } catch (err) {
    return handleError(err);
  }
}
