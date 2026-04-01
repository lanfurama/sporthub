import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma, MembershipStatus, MembershipPlan, UserRole, CreditTxType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

const CreateMemberSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^0\d{9}$/).optional(),
  email: z.string().email().optional(),
  plan: z.enum(['basic', 'prime', 'vip']),
});

export async function listMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const { plan, search, expiringSoon } = req.query;

    const where: Prisma.UserWhereInput = { memberships: { some: { status: MembershipStatus.active } } };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        memberships: {
          where: {
            status: MembershipStatus.active,
            ...(plan ? {
              plan: (() => {
                const planMap: Record<string, MembershipPlan> = {
                  'basic': MembershipPlan.basic,
                  'prime': MembershipPlan.prime,
                  'vip': MembershipPlan.vip,
                };
                return planMap[plan as string];
              })()
            } : {}),
          },
          include: { planConfig: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    let result = users.filter(u => u.memberships.length > 0);

    if (expiringSoon === 'true') {
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);
      result = result.filter(u => new Date(u.memberships[0].expiresAt) <= in7Days);
    }

    res.json({ success: true, data: result, meta: { total: result.length } });
  } catch (err) {
    next(err);
  }
}

export async function getMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const isAdmin = req.user && ['staff', 'admin', 'super_admin'].includes(req.user.role);
    if (!isAdmin && req.user?.id !== id) {
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
    res.json({
      success: true,
      data: {
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
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createMember(req: Request, res: Response, next: NextFunction) {
  try {
    const data = CreateMemberSchema.parse(req.body);
    const planConfig = await prisma.membershipPlanConfig.findUnique({ where: { id: data.plan } });
    if (!planConfig) throw new AppError(400, 'INVALID_PLAN', 'Gói không hợp lệ');

    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: UserRole.member,
        memberships: {
          create: {
            plan: data.plan as MembershipPlan,
            status: MembershipStatus.active,
            startedAt: new Date(),
            expiresAt: new Date(Date.now() + planConfig.durationDays * 86400000),
            creditBalance: planConfig.creditPerCycle,
            guestPasses: planConfig.guestPasses,
          },
        },
      },
      include: { memberships: true },
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function addCredit(req: Request, res: Response, next: NextFunction) {
  try {
    const { amount, reason } = z.object({
      amount: z.number().int().positive(),
      reason: z.string().optional(),
    }).parse(req.body);

    const membership = await prisma.membership.findFirst({
      where: { userId: req.params.id, status: MembershipStatus.active },
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

    res.json({ success: true, data: { newBalance: membership.creditBalance + amount } });
  } catch (err) {
    next(err);
  }
}
