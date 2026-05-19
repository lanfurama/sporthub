import { NextRequest } from 'next/server';
import { MembershipStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    const { id } = await params;

    const isAdmin = ['staff', 'admin', 'super_admin'].includes(ctx.role);
    if (!isAdmin && ctx.userId !== id) {
      throw new AppError(403, 'FORBIDDEN', 'Không có quyền truy cập');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          where: { status: MembershipStatus.active },
          include: { planConfig: true, creditTransactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
          take: 1,
        },
      },
    });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy thành viên');

    const membership = user.memberships[0];
    return ok({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      plan: membership?.plan,
      joinDate: membership?.startedAt,
      expiry: membership?.expiresAt,
      credit: membership?.creditBalance,
      guestPassesRemaining: membership?.guestPasses,
      benefits: membership?.planConfig
        ? {
            courtDiscount: membership.planConfig.courtDiscountPct,
            shopDiscount: membership.planConfig.shopDiscountPct,
            priorityBooking: membership.planConfig.priorityBooking,
            creditPerMonth: membership.planConfig.creditPerCycle,
          }
        : null,
      creditHistory: membership?.creditTransactions,
    });
  } catch (err) {
    return handleError(err);
  }
}
