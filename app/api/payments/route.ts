import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { createVNPayPaymentUrl } from '@/src/lib/vnpay';
import { createMoMoPaymentUrl } from '@/src/lib/momo';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const CreatePaymentSchema = z.object({
  type: z.enum(['booking', 'order']),
  referenceId: z.string(),
  amount: z.number().int().positive(),
  paymentMethod: z.enum(['vnpay', 'momo']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, referenceId, amount, paymentMethod } = CreatePaymentSchema.parse(body);

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
    let orderDescription = '';
    let returnUrl = '';
    let notifyUrl = '';

    if (type === 'booking') {
      const booking = await prisma.booking.findUnique({
        where: { id: referenceId },
        include: { court: { select: { name: true } } },
      });
      if (!booking) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đặt sân');
      orderDescription = `Đặt sân ${booking.court.name} - ${booking.ref}`;
      returnUrl = `${clientUrl}/payment/callback?type=booking&id=${referenceId}`;
      notifyUrl = `${clientUrl}/api/payments/webhook?type=booking&id=${referenceId}`;
    } else {
      const order = await prisma.order.findUnique({ where: { id: referenceId } });
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng');
      orderDescription = `Đơn hàng ${order.id}`;
      returnUrl = `${clientUrl}/payment/callback?type=order&id=${referenceId}`;
      notifyUrl = `${clientUrl}/api/payments/webhook?type=order&id=${referenceId}`;
    }

    let paymentUrl = '';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddr = forwardedFor?.split(',')[0]?.trim() ?? '127.0.0.1';

    if (paymentMethod === 'vnpay') {
      paymentUrl = createVNPayPaymentUrl({
        amount,
        orderId: referenceId,
        orderDescription,
        returnUrl,
        ipAddr,
      });
    } else {
      paymentUrl = await createMoMoPaymentUrl({
        amount,
        orderId: referenceId,
        orderInfo: orderDescription,
        returnUrl,
        notifyUrl,
      });
    }

    return ok({ paymentUrl });
  } catch (err) {
    return handleError(err);
  }
}
