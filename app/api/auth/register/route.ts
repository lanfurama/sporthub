import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/src/lib/jwt';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const RegisterSchema = z
  .object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^0\d{9}$/).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8),
  })
  .refine((d) => d.phone || d.email, { message: 'phone hoặc email là bắt buộc' });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    if (data.email) {
      const exists = await prisma.user.findUnique({ where: { email: data.email } });
      if (exists) throw new AppError(409, 'EMAIL_TAKEN', 'Email đã được sử dụng');
    }
    if (data.phone) {
      const exists = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (exists) throw new AppError(409, 'PHONE_TAKEN', 'Số điện thoại đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        passwordHash,
        role: UserRole.guest,
      },
      select: { id: true, name: true, phone: true, email: true, role: true },
    });

    const accessToken = signAccessToken({ id: user.id, role: user.role, name: user.name });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role, name: user.name });

    return ok({ user, tokens: { accessToken, refreshToken, expiresIn: 900 } }, 201);
  } catch (err) {
    return handleError(err);
  }
}
