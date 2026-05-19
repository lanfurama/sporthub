import { NextRequest } from 'next/server';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/src/lib/jwt';
import { verifyOTP, invalidateOTPs } from '@/src/lib/otp';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const Verify2FASchema = z.object({
  identifier: z.string().min(1),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, code } = Verify2FASchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        isActive: true,
        role: { in: [UserRole.admin, UserRole.staff, UserRole.super_admin] },
      },
      include: {
        memberships: {
          where: { status: 'active' },
          select: { plan: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng');
    }

    const valid = await verifyOTP(user.id, code, 'admin_2fa');
    if (!valid) {
      throw new AppError(400, 'INVALID_OTP', 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await invalidateOTPs(user.id, 'admin_2fa');

    const accessToken = signAccessToken({ id: user.id, role: user.role, name: user.name });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role, name: user.name });

    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email ?? '',
        phone: user.phone ?? undefined,
        role: user.role,
        plan: user.memberships[0]?.plan ?? null,
      },
      tokens: { accessToken, refreshToken, expiresIn: 900 },
    });
  } catch (err) {
    return handleError(err);
  }
}
