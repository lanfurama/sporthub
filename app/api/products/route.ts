import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/src/lib/prisma';
import { getAuthContext, requireMinRole } from '@/src/lib/auth-middleware';
import { ok, handleError } from '@/src/lib/api-response';

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  price: z.number().int().min(0),
  stock: z.number().int().min(0).optional(),
  isService: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const search = req.nextUrl.searchParams.get('search');
    const inStock = req.nextUrl.searchParams.get('inStock');

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.active,
      ...(category ? { category } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...(inStock === 'true' ? { OR: [{ stock: { gt: 0 } }, { isService: true }] } : {}),
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return ok(products);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = getAuthContext(req);
    requireMinRole(ctx, 'admin');

    const body = await req.json();
    const data = ProductSchema.parse(body);
    const product = await prisma.product.create({ data });
    return ok(product, 201);
  } catch (err) {
    return handleError(err);
  }
}
