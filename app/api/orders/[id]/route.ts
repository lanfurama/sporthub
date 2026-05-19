import { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy đơn hàng');

    // Non-admin can only view their own orders
    const isAdmin = ['staff', 'admin', 'super_admin'].includes(ctx.role);
    if (!isAdmin && order.customerId !== ctx.userId) {
      throw new AppError(403, 'FORBIDDEN', 'Không có quyền truy cập');
    }

    return ok(order);
  } catch (err) {
    return handleError(err);
  }
}
