import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProductStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  price: z.number().int().min(0),
  stock: z.number().int().min(0).optional(),
  isService: z.boolean().optional(),
});

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, search, inStock } = req.query;
    const products = await prisma.product.findMany({
      where: {
        status: ProductStatus.active,
        ...(category ? { category: category as string } : {}),
        ...(search ? { name: { contains: search as string, mode: 'insensitive' } } : {}),
        ...(inStock === 'true' ? { OR: [{ stock: { gt: 0 } }, { isService: true }] } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm');
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = ProductSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const data = ProductSchema.partial().parse(req.body);
    const product = await prisma.product.update({ where: { id }, data });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.update({ where: { id }, data: { status: ProductStatus.inactive } });
    res.json({ success: true, message: 'Sản phẩm đã bị xóa' });
  } catch (err) {
    next(err);
  }
}
