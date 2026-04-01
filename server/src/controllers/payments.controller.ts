import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BookingStatus, OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';
import { createVNPayPaymentUrl, verifyVNPayCallback } from '../lib/vnpay';
import { createMoMoPaymentUrl, verifyMoMoCallback } from '../lib/momo';
import { env } from '../config/env';

const CreatePaymentSchema = z.object({
  type: z.enum(['booking', 'order']),
  referenceId: z.string(),
  amount: z.number().int().positive(),
  paymentMethod: z.enum(['vnpay', 'momo']),
});

export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, referenceId, amount, paymentMethod } = CreatePaymentSchema.parse(req.body);

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
      returnUrl = `${env.CLIENT_URL}/payment/callback?type=booking&id=${referenceId}`;
      notifyUrl = `${env.CLIENT_URL}/api/v1/payments/webhook?type=booking&id=${referenceId}`;
    } else {
      const order = await prisma.order.findUnique({ where: { id: referenceId } });
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng');
      orderDescription = `Đơn hàng ${order.id}`;
      returnUrl = `${env.CLIENT_URL}/payment/callback?type=order&id=${referenceId}`;
      notifyUrl = `${env.CLIENT_URL}/api/v1/payments/webhook?type=order&id=${referenceId}`;
    }

    let paymentUrl = '';

    if (paymentMethod === 'vnpay') {
      paymentUrl = createVNPayPaymentUrl({
        amount,
        orderId: referenceId,
        orderDescription,
        returnUrl,
        ipAddr: req.ip || req.socket.remoteAddress || '127.0.0.1',
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

    res.json({
      success: true,
      data: { paymentUrl },
    });
  } catch (err) {
    next(err);
  }
}

export async function vnpayWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, id } = z.object({
      type: z.enum(['booking', 'order']),
      id: z.string(),
    }).parse(req.query);

    const result = verifyVNPayCallback(req.query as Record<string, string>);

    if (!result.isValid) {
      throw new AppError(400, 'INVALID_SIGNATURE', 'Chữ ký không hợp lệ');
    }

    if (result.responseCode !== '00') {
      res.json({ success: false, message: 'Thanh toán thất bại' });
      return;
    }

    if (type === 'booking') {
      await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.confirmed,
          payMethod: 'vnpay',
        },
      });
    } else {
      await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.paid,
          payMethod: 'vnpay',
        },
      });
    }

    res.json({ success: true, message: 'Thanh toán thành công' });
  } catch (err) {
    next(err);
  }
}

export async function momoWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, id } = z.object({
      type: z.enum(['booking', 'order']),
      id: z.string(),
    }).parse(req.query);

    const result = verifyMoMoCallback(req.body as Record<string, string>);

    if (!result.isValid) {
      throw new AppError(400, 'INVALID_SIGNATURE', 'Chữ ký không hợp lệ');
    }

    if (result.resultCode !== '0') {
      res.json({ success: false, message: 'Thanh toán thất bại' });
      return;
    }

    if (type === 'booking') {
      await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.confirmed,
          payMethod: 'momo',
        },
      });
    } else {
      await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.paid,
          payMethod: 'momo',
        },
      });
    }

    res.json({ success: true, message: 'Thanh toán thành công' });
  } catch (err) {
    next(err);
  }
}
