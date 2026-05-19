import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { generateOTP } from '@/src/lib/otp';
import { sendOTP } from '@/src/lib/sms';
import { handleError } from '@/src/lib/api-response';

const ForgotSchema = z.object({
  phone: z.string().regex(/^0\d{9}$/),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = ForgotSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Nếu số điện thoại tồn tại, OTP đã được gửi',
        expiresIn: 300,
      });
    }

    const code = await generateOTP(user.id, 'password_reset');
    await sendOTP(phone, code);

    return NextResponse.json({ success: true, message: 'OTP đã được gửi', expiresIn: 300 });
  } catch (err) {
    return handleError(err);
  }
}
