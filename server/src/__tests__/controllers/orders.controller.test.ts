import { Request, Response, NextFunction } from 'express';
import { createOrder, listOrders, getOrder } from '../../controllers/orders.controller';
import { testHelpers } from '../helpers';
import { OrderStatus, ProductStatus } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';
import { prisma } from '../../lib/prisma';

describe('Orders Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = testHelpers.mockRequest();
    res = testHelpers.mockResponse();
    next = testHelpers.mockNext();
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 100000,
          stock: 10,
          status: 'active' as any,
        },
      });

      req.body = {
        items: [
          {
            productId: product.id,
            quantity: 2,
          },
        ],
      };

      await createOrder(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            subtotal: 200000,
          }),
        })
      );
    });

    it('should return 400 if product not found', async () => {
      req.body = {
        items: [
          {
            productId: 99999,
            quantity: 1,
          },
        ],
      };

      await createOrder(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should apply member discount', async () => {
      const { membership } = await testHelpers.createMember();
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 100000,
          stock: 10,
          status: 'active' as any,
        },
      });

      req.body = {
        items: [{ productId: product.id, quantity: 1 }],
        memberId: membership.id,
      };

      await createOrder(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('listOrders', () => {
    it('should return all orders', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 100000,
          stock: 10,
          status: 'active' as any,
        },
      });

      await prisma.order.create({
        data: {
          subtotal: 100000,
          discountAmount: 0,
          creditUsed: 0,
          total: 100000,
          status: 'paid' as any,
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100000,
              subtotal: 100000,
            },
          },
        },
      });

      req.query = {};
      await listOrders(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        })
      );
    });
  });

  describe('getOrder', () => {
    it('should return order by id', async () => {
      const { user } = await testHelpers.createMember();
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 100000,
          stock: 10,
          status: 'active' as any,
        },
      });

      const order = await prisma.order.create({
        data: {
          customerId: user.id,
          subtotal: 100000,
          discountAmount: 0,
          creditUsed: 0,
          total: 100000,
          status: 'paid',
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: 100000,
              subtotal: 100000,
            },
          },
        },
      });

      req.user = { id: user.id } as any;
      req.params = { id: order.id };

      await getOrder(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: order.id }),
        })
      );
    });
  });
});
