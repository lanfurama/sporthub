import { env } from '../config/env';

interface SMSOptions {
  phone: string;
  message: string;
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  const { phone, message } = options;

  if (!env.ESMS_API_KEY || !env.ESMS_SECRET_KEY) {
    console.warn('[SMS] ESMS credentials not configured, skipping SMS send');
    console.log(`[SMS] Would send to ${phone}: ${message}`);
    return true;
  }

  try {
    const response = await fetch('https://rest-api.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json() as { CodeResult?: number };
    return data.CodeResult === 100;
  } catch (error) {
    console.error('[SMS] Failed to send SMS:', error);
    return false;
  }
}

export async function sendOTP(phone: string, code: string): Promise<boolean> {
  const message = `Ma OTP cua ban la: ${code}. Ma co hieu luc trong 5 phut. Khong chia se ma nay voi ai.`;
  return sendSMS({ phone, message });
}
