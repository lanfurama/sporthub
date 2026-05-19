import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { verifyOTP, invalidateOTPs } from '@/src/lib/otp';
import { AppError, handleError } from '@/src/lib/api-response';

const ResetPasswordSchema = z.object({
  phone: z.string().regex(/^0\d{9}$/),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, newPassword } = ResetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng');
    }

    const valid = await verifyOTP(user.id, code, 'password_reset');
    if (!valid) {
      throw new AppError(400, 'INVALID_OTP', 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await invalidateOTPs(user.id, 'password_reset');

    return NextResponse.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    return handleError(err);
  }
}
