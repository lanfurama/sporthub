import crypto from 'crypto';
import { env } from '../config/env';

interface VNPayPaymentParams {
  amount: number;
  orderId: string;
  orderDescription: string;
  returnUrl: string;
  ipAddr?: string;
}

export function createVNPayPaymentUrl(params: VNPayPaymentParams): string {
  const {
    amount,
    orderId,
    orderDescription,
    returnUrl,
    ipAddr = '127.0.0.1',
  } = params;

  const tmnCode = env.VNPAY_TMN_CODE;
  const secretKey = env.VNPAY_HASH_SECRET;
  const vnpUrl = env.VNPAY_URL;
  const vnpVersion = '2.1.0';
  const vnpCommand = 'pay';
  const vnpCurrCode = 'VND';
  const vnpLocale = 'vn';
  const vnpTxnRef = orderId;
  const vnpOrderInfo = orderDescription;
  const vnpOrderType = 'other';
  const vnpAmount = amount * 100;
  const vnpReturnUrl = returnUrl;
  const vnpIpAddr = ipAddr;
  const vnpCreateDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '';

  const vnpParams: Record<string, string> = {
    vnp_Version: vnpVersion,
    vnp_Command: vnpCommand,
    vnp_TmnCode: tmnCode,
    vnp_Locale: vnpLocale,
    vnp_CurrCode: vnpCurrCode,
    vnp_TxnRef: vnpTxnRef,
    vnp_OrderInfo: vnpOrderInfo,
    vnp_OrderType: vnpOrderType,
    vnp_Amount: vnpAmount.toString(),
    vnp_ReturnUrl: vnpReturnUrl,
    vnp_IpAddr: vnpIpAddr,
    vnp_CreateDate: vnpCreateDate,
  };

  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {} as Record<string, string>);

  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', secretKey);
  hmac.update(signData);
  const vnpSecureHash = hmac.digest('hex');

  sortedParams['vnp_SecureHash'] = vnpSecureHash;

  const paymentUrl = vnpUrl + '?' + new URLSearchParams(sortedParams).toString();
  return paymentUrl;
}

export function verifyVNPayCallback(query: Record<string, string>): {
  isValid: boolean;
  orderId: string;
  amount: number;
  transactionId: string;
  responseCode: string;
} {
  const secretKey = env.VNPAY_HASH_SECRET;
  const vnpSecureHash = query['vnp_SecureHash'];

  delete query['vnp_SecureHash'];
  delete query['vnp_SecureHashType'];

  const sortedParams = Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      if (query[key]) {
        acc[key] = query[key];
      }
      return acc;
    }, {} as Record<string, string>);

  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', secretKey);
  hmac.update(signData);
  const checkSum = hmac.digest('hex');

  const isValid = checkSum === vnpSecureHash;
  const responseCode = query['vnp_ResponseCode'] || '';

  return {
    isValid,
    orderId: query['vnp_TxnRef'] || '',
    amount: parseInt(query['vnp_Amount'] || '0') / 100,
    transactionId: query['vnp_TransactionNo'] || '',
    responseCode,
  };
}
