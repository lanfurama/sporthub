import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { generateOTP, verifyOTP, invalidateOTPs } from '../lib/otp';
import { sendOTP } from '../lib/sms';
import { getGoogleAuthUrl, handleGoogleCallback } from '../lib/oauth';

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^0\d{9}$/).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8),
}).refine(d => d.phone || d.email, { message: 'phone hoặc email là bắt buộc' });

const LoginSchema = z.object({
  identifier: z.string().min(1),   // phone or email
  password: z.string().min(1),
});

const ForgotSchema = z.object({
  phone: z.string().regex(/^0\d{9}$/),
});

const ResetPasswordSchema = z.object({
  phone: z.string().regex(/^0\d{9}$/),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const AdminLoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const Verify2FASchema = z.object({
  identifier: z.string().min(1),
  code: z.string().length(6),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = RegisterSchema.parse(req.body);

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
    res.status(201).json({ 
      success: true, 
      data: { 
        user, 
        tokens: { accessToken, refreshToken, expiresIn: 900 } 
      } 
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = LoginSchema.parse(req.body);

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
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email ?? '',
          phone: user.phone ?? undefined,
          role: user.role,
          plan: user.memberships[0]?.plan ?? null,
        },
        tokens: { accessToken, refreshToken, expiresIn: 900 },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = ForgotSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      res.json({ success: true, message: 'Nếu số điện thoại tồn tại, OTP đã được gửi', expiresIn: 300 });
      return;
    }

    const code = await generateOTP(user.id, 'password_reset');
    await sendOTP(phone, code);

    res.json({ success: true, message: 'OTP đã được gửi', expiresIn: 300 });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, code, newPassword } = ResetPasswordSchema.parse(req.body);

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

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);

    const payload = verifyRefreshToken(refreshToken);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.id, isActive: true },
      select: { id: true, role: true, name: true },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_TOKEN', 'Token không hợp lệ');
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role, name: user.name });

    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 900,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = AdminLoginSchema.parse(req.body);

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

    res.json({
      success: true,
      data: {
        requires2FA: true,
        message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
        expiresIn: 300,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function verify2FA(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, code } = Verify2FASchema.parse(req.body);

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

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email ?? '',
          phone: user.phone ?? undefined,
          role: user.role,
          plan: user.memberships[0]?.plan ?? null,
        },
        tokens: { accessToken, refreshToken, expiresIn: 900 },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authUrl = await getGoogleAuthUrl();
    res.json({ success: true, data: { authUrl } });
  } catch (err) {
    next(err);
  }
}

export async function googleCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = z.object({ code: z.string() }).parse(req.query);

    const result = await handleGoogleCallback(code);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
