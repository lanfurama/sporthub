import { NextRequest } from 'next/server';
import { z } from 'zod';
import { MembershipStatus, CreditTxType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const AddCreditSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'admin');

    const { id } = await params;
    const body = await req.json();
    const { amount, reason } = AddCreditSchema.parse(body);

    const membership = await prisma.membership.findFirst({
      where: { userId: id, status: MembershipStatus.active },
    });
    if (!membership) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy gói thành viên active');

    // Guard: reject if membership has already expired (DB status may lag behind real time)
    if (new Date(membership.expiresAt) < new Date()) {
      throw new AppError(400, 'MEMBERSHIP_EXPIRED', 'Gói thành viên đã hết hạn, không thể cộng credit');
    }

    await prisma.$transaction([
      prisma.membership.update({
        where: { id: membership.id },
        data: { creditBalance: { increment: amount } },
      }),
      prisma.creditTransaction.create({
        data: {
          membershipId: membership.id,
          amount,
          type: CreditTxType.credit,
          referenceType: 'manual',
          note: reason,
        },
      }),
    ]);

    return ok({ newBalance: membership.creditBalance + amount });
  } catch (err) {
    return handleError(err);
  }
}
