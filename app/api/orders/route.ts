import { NextRequest } from 'next/server';
import { z } from 'zod';
import { OrderStatus, ProductStatus, MembershipStatus, CreditTxType } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole, type AuthContext } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const OrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })).min(1),
  memberId: z.string().uuid().optional(),
  useCredit: z.boolean().optional(),
  payMethod: z.string().optional(),
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
    const ctx = tryGetAuthContext(req); // anonymous orders allowed (optionalAuth)
    const body = await req.json();
    const data = OrderSchema.parse(body);

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
          customerId: ctx?.userId ?? null,
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

    return ok(
      { orderId: order.id, subtotal, memberDiscount: discountAmount, creditUsed, total, payMethod: data.payMethod },
      201,
    );
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'staff');

    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10);
    const skip = (page - 1) * limit;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.order.count(),
    ]);

    return Response.json({ success: true, data: orders, meta: { total, page } });
  } catch (err) {
    return handleError(err);
  }
}
