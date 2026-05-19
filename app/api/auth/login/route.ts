import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/src/lib/jwt';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const LoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = LoginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        isActive: true,
      },
      include: {
        memberships: {
          where: { status: 'active' },
          select: { plan: true },
          take: 1,
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Sai tài khoản hoặc mật khẩu');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Sai tài khoản hoặc mật khẩu');

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

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
