import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ProductStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, AppError, handleError } from '@/src/lib/api-response';

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  price: z.number().int().min(0),
  stock: z.number().int().min(0).optional(),
  isService: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm');
    return ok(product);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'admin');

    const { id } = await params;
    const body = await req.json();
    const data = ProductSchema.partial().parse(body);
    const product = await prisma.product.update({ where: { id: parseInt(id) }, data });
    return ok(product);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'admin');

    const { id } = await params;
    await prisma.product.update({ where: { id: parseInt(id) }, data: { status: ProductStatus.inactive } });
    return Response.json({ success: true, message: 'Sản phẩm đã bị xóa' });
  } catch (err) {
    return handleError(err);
  }
}
