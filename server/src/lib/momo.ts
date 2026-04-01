import crypto from 'crypto';
import { env } from '../config/env';

interface MoMoPaymentParams {
  amount: number;
  orderId: string;
  orderInfo: string;
  returnUrl: string;
  notifyUrl: string;
  extraData?: string;
}

export async function createMoMoPaymentUrl(params: MoMoPaymentParams): Promise<string> {
  const {
    amount,
    orderId,
    orderInfo,
    returnUrl,
    notifyUrl,
    extraData = '',
  } = params;

  const partnerCode = env.MOMO_PARTNER_CODE;
  const accessKey = env.MOMO_ACCESS_KEY;
  const secretKey = env.MOMO_SECRET_KEY;
  const endpoint = env.MOMO_ENDPOINT;

  const requestId = orderId + Date.now();
  const orderGroupId = '';
  const autoCapture = true;
  const lang = 'vi';

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=captureWallet`;

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode,
    partnerName: 'SportHub',
    storeId: 'SportHub',
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: returnUrl,
    ipnUrl: notifyUrl,
    lang,
    extraData,
    requestType: 'captureWallet',
    autoCapture,
    orderGroupId,
    signature,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json() as { resultCode: number; payUrl?: string; message?: string };
    
    if (data.resultCode === 0) {
      return data.payUrl!;
    } else {
      throw new Error(`MoMo error: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[MoMo] Failed to create payment URL:', error);
    throw error;
  }
}

export function verifyMoMoCallback(query: Record<string, string>): {
  isValid: boolean;
  orderId: string;
  amount: number;
  transactionId: string;
  resultCode: string;
} {
  const secretKey = env.MOMO_SECRET_KEY;
  const signature = query['signature'];
  const accessKey = query['accessKey'];
  const partnerCode = query['partnerCode'];
  const orderId = query['orderId'];
  const requestId = query['requestId'];
  const amount = query['amount'];
  const orderInfo = query['orderInfo'];
  const orderType = query['orderType'] || '';
  const transId = query['transId'];
  const resultCode = query['resultCode'];
  const message = query['message'] || '';
  const payType = query['payType'] || '';
  const responseTime = query['responseTime'] || '';
  const extraData = query['extraData'] || '';

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const checkSum = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
  const isValid = checkSum === signature;

  return {
    isValid,
    orderId: orderId || '',
    amount: parseInt(amount || '0'),
    transactionId: transId || '',
    resultCode: resultCode || '',
  };
}
