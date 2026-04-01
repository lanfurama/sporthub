import bcrypt from 'bcrypt';
import { prisma } from './prisma';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

export async function generateOTP(userId: string, purpose: 'password_reset' | 'admin_2fa' | 'phone_verify'): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      userId,
      purpose,
      codeHash,
      expiresAt,
      channel: 'sms',
    },
  });

  return code;
}

export async function verifyOTP(userId: string, code: string, purpose: 'password_reset' | 'admin_2fa' | 'phone_verify'): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) return false;

  const valid = await bcrypt.compare(code, otp.codeHash);
  
  if (!valid) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  return true;
}

export async function invalidateOTPs(userId: string, purpose: 'password_reset' | 'admin_2fa' | 'phone_verify'): Promise<void> {
  await prisma.otpCode.updateMany({
    where: {
      userId,
      purpose,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}
