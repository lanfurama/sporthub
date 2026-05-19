import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { generateOTP } from '@/src/lib/otp';
import { sendOTP } from '@/src/lib/sms';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const AdminLoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = AdminLoginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
        isActive: true,
        role: { in: [UserRole.admin, UserRole.staff, UserRole.super_admin] },
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Sai tài khoản hoặc mật khẩu');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Sai tài khoản hoặc mật khẩu');
    }

    const code = await generateOTP(user.id, 'admin_2fa');
    if (user.phone) {
      await sendOTP(user.phone, code);
    }

    return ok({
      requires2FA: true,
      message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
      expiresIn: 300,
    });
  } catch (err) {
    return handleError(err);
  }
}
