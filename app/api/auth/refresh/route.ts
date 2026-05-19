import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { signAccessToken, verifyRefreshToken } from '@/src/lib/jwt';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = RefreshTokenSchema.parse(body);

    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.id, isActive: true },
      select: { id: true, role: true, name: true },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_TOKEN', 'Token không hợp lệ');
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role, name: user.name });

    return ok({
      accessToken,
      expiresIn: 900,
    });
  } catch (err) {
    return handleError(err);
  }
}
