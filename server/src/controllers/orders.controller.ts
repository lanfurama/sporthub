import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrderStatus, ProductStatus, MembershipStatus, CreditTxType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

const OrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })).min(1),
  memberId: z.string().uuid().optional(),
  useCredit: z.boolean().optional(),
  payMethod: z.string().optional(),
});

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const data = OrderSchema.parse(req.body);

    const productIds = data.items.map(i => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, status: ProductStatus.active } });
    if (products.length !== productIds.length) throw new AppError(400, 'PRODUCT_NOT_FOUND', 'Một số sản phẩm không tồn tại');

    let membership = null;
    if (data.memberId) {
      membership = await prisma.membership.findFirst({
        where: { id: data.memberId, status: MembershipStatus.active },
        include: { planConfig: true },
      });
    }

    const items = data.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const subtotal = product.price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, unitPrice: product.price, subtotal };
    });

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const discountPct = membership?.planConfig.shopDiscountPct ?? 0;
    const discountAmount = Math.round(subtotal * discountPct / 100);
    const afterDiscount = subtotal - discountAmount;
    const creditUsed = data.useCredit && membership
      ? Math.min(membership.creditBalance, afterDiscount)
      : 0;
    const total = afterDiscount - creditUsed;

    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock for non-services
      for (const item of items) {
        const product = products.find(p => p.id === item.productId)!;
        if (!product.isService) {
          const updated = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.stock < 0) throw new AppError(400, 'OUT_OF_STOCK', `${product.name} không đủ hàng`);
        }
      }

      const newOrder = await tx.order.create({
        data: {
          customerId: req.user?.id ?? null,
          membershipId: data.memberId ?? null,
          subtotal,
          discountAmount,
          creditUsed,
          total,
          payMethod: data.payMethod,
          status: OrderStatus.paid,
          items: { create: items },
        },
        include: { items: true },
      });

      if (creditUsed > 0 && membership) {
        await tx.membership.update({
          where: { id: membership.id },
          data: { creditBalance: { decrement: creditUsed } },
        });
        // FIX: store positive amount — type field signals direction
        await tx.creditTransaction.create({
          data: {
            membershipId: membership.id,
            amount: creditUsed,
            type: CreditTxType.debit,
            referenceType: 'order',
            referenceId: newOrder.id,
          },
        });
      }

      return newOrder;
    });

    res.status(201).json({
      success: true,
      data: { orderId: order.id, subtotal, memberDiscount: discountAmount, creditUsed, total, payMethod: data.payMethod },
    });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit as string) }),
      prisma.order.count(),
    ]);
    res.json({ success: true, data: orders, meta: { total, page: parseInt(page as string) } });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng');

    // Non-admin can only view their own orders
    const isAdmin = req.user && ['staff', 'admin', 'super_admin'].includes(req.user.role);
    if (!isAdmin && order.customerId !== req.user?.id) {
      throw new AppError(403, 'FORBIDDEN', 'Không có quyền truy cập');
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}
