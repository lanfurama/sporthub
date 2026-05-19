import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma, MembershipStatus, MembershipPlan, UserRole } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const CreateMemberSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^0\d{9}$/).optional(),
  email: z.string().email().optional(),
  plan: z.enum(['basic', 'prime', 'vip']),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'staff');

    const plan = req.nextUrl.searchParams.get('plan');
    const search = req.nextUrl.searchParams.get('search');
    const expiringSoon = req.nextUrl.searchParams.get('expiringSoon');

    const where: Prisma.UserWhereInput = { memberships: { some: { status: MembershipStatus.active } } };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
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
                return planMap[plan];
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

    return Response.json({ success: true, data: result, meta: { total: result.length } });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'admin');

    const body = await req.json();
    const data = CreateMemberSchema.parse(body);

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

    return ok(user, 201);
  } catch (err) {
    return handleError(err);
  }
}
