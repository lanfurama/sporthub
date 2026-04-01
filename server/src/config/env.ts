import dotenv from 'dotenv';
dotenv.config();

import { getDatabaseUrl } from './database';

export const env = {
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL ?? getDatabaseUrl(),
  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  // SMS
  ESMS_API_KEY: process.env.ESMS_API_KEY ?? '',
  ESMS_SECRET_KEY: process.env.ESMS_SECRET_KEY ?? '',
  // Email
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ?? '',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL ?? 'noreply@sporthub.vn',
  // Payment
  VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE ?? '',
  VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET ?? '',
  VNPAY_URL: process.env.VNPAY_URL ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE ?? '',
  MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY ?? '',
  MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY ?? '',
  MOMO_ENDPOINT: process.env.MOMO_ENDPOINT ?? 'https://test-payment.momo.vn/v2/gateway/api/create',
};
