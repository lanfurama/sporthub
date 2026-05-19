import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { createVNPayPaymentUrl } from '@/src/lib/vnpay';
import { createMoMoPaymentUrl } from '@/src/lib/momo';
import { ok, AppError, handleError } from '@/src/lib/api-response';
import { getAuthContext, type AuthContext } from '@/src/lib/auth-middleware';

const CreatePaymentSchema = z.object({
  type: z.enum(['booking', 'order']),
  referenceId: z.string(),
  amount: z.number().int().positive(),
  paymentMethod: z.enum(['vnpay', 'momo']),
});

function tryGetAuthContext(req: NextRequest): AuthContext | null {
  try {
    return getAuthContext(req);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, referenceId, amount, paymentMethod } = CreatePaymentSchema.parse(body);
    const ctx = tryGetAuthContext(req); // anonymous booking payment allowed

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
      // Ownership: if the booking has an owner, the requester must be that owner
      // (or staff/admin). Anonymous bookings (customerId === null) can be paid by
      // anyone holding the booking id — same trust model as legacy server.
      if (booking.customerId !== null) {
        const isAdmin = ctx && ['staff', 'admin', 'super_admin'].includes(ctx.role);
        if (!isAdmin && (!ctx || ctx.userId !== booking.customerId)) {
          throw new AppError(403, 'FORBIDDEN', 'Không có quyền thanh toán đặt sân này');
        }
      }
      // Amount must match the booking's final price — clients cannot underpay.
      if (Number(booking.finalPrice) !== amount) {
        throw new AppError(400, 'AMOUNT_MISMATCH', 'Số tiền không khớp');
      }
      orderDescription = `Đặt sân ${booking.court.name} - ${booking.ref}`;
      returnUrl = `${clientUrl}/payment/callback?type=booking&id=${referenceId}`;
      notifyUrl = `${clientUrl}/api/payments/webhook?type=booking&id=${referenceId}`;
    } else {
      const order = await prisma.order.findUnique({ where: { id: referenceId } });
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng');
      if (order.customerId !== null) {
        const isAdmin = ctx && ['staff', 'admin', 'super_admin'].includes(ctx.role);
        if (!isAdmin && (!ctx || ctx.userId !== order.customerId)) {
          throw new AppError(403, 'FORBIDDEN', 'Không có quyền thanh toán đơn hàng này');
        }
      }
      if (Number(order.total) !== amount) {
        throw new AppError(400, 'AMOUNT_MISMATCH', 'Số tiền không khớp');
      }
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
