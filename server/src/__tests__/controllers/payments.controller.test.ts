import { Request, Response, NextFunction } from 'express';
import { createPayment, vnpayWebhook, momoWebhook } from '../../controllers/payments.controller';
import { testHelpers } from '../helpers';
import { BookingStatus, OrderStatus } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';

jest.mock('../../lib/vnpay', () => ({
  createVNPayPaymentUrl: jest.fn(() => 'https://vnpay.vn/payment'),
  verifyVNPayCallback: jest.fn(() => ({ isValid: true, responseCode: '00' })),
}));

jest.mock('../../lib/momo', () => ({
  createMoMoPaymentUrl: jest.fn(() => Promise.resolve('https://momo.vn/payment')),
  verifyMoMoCallback: jest.fn(() => ({ isValid: true, resultCode: '0' })),
}));

describe('Payments Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = testHelpers.mockRequest();
    res = testHelpers.mockResponse();
    next = testHelpers.mockNext();
  });

  describe('createPayment', () => {
    it('should create payment URL for booking', async () => {
      const booking = await testHelpers.createBooking();

      req.body = {
        type: 'booking',
        referenceId: booking.id,
        amount: 100000,
        paymentMethod: 'vnpay',
      };

      await createPayment(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            paymentUrl: expect.any(String),
          }),
        })
      );
    });

    it('should create payment URL for order', async () => {
      const { prisma } = require('../../lib/prisma');
      const order = await prisma.order.create({
        data: {
          subtotal: 100000,
          discountAmount: 0,
          creditUsed: 0,
          total: 100000,
          status: 'pending' as any,
        },
      });

      req.body = {
        type: 'order',
        referenceId: order.id,
        amount: 100000,
        paymentMethod: 'momo',
      };

      await createPayment(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            paymentUrl: expect.any(String),
          }),
        })
      );
    });

    it('should return 404 if booking not found', async () => {
      req.body = {
        type: 'booking',
        referenceId: 'non-existent-id',
        amount: 100000,
        paymentMethod: 'vnpay',
      };

      await createPayment(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('vnpayWebhook', () => {
    it('should update booking status on successful payment', async () => {
      const booking = await testHelpers.createBooking({ status: 'pending' });

      req.query = { type: 'booking', id: booking.id };
      req.query = { ...req.query, ...{ vnp_ResponseCode: '00' } } as any;

      await vnpayWebhook(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should update order status on successful payment', async () => {
      const { prisma } = require('../../lib/prisma');
      const order = await prisma.order.create({
        data: {
          subtotal: 100000,
          discountAmount: 0,
          creditUsed: 0,
          total: 100000,
          status: 'pending' as any,
        },
      });

      req.query = { type: 'order', id: order.id };
      req.query = { ...req.query, ...{ vnp_ResponseCode: '00' } } as any;

      await vnpayWebhook(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });

  describe('momoWebhook', () => {
    it('should update booking status on successful payment', async () => {
      const booking = await testHelpers.createBooking({ status: 'pending' });

      req.query = { type: 'booking', id: booking.id };
      req.body = { resultCode: '0' };

      await momoWebhook(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });
});
