import { Request, Response, NextFunction } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../../controllers/products.controller';
import { testHelpers } from '../helpers';
import { ProductStatus } from '@prisma/client';
import { AppError } from '../../middleware/error.middleware';
import { prisma } from '../../lib/prisma';

describe('Products Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = testHelpers.mockRequest();
    res = testHelpers.mockResponse();
    next = testHelpers.mockNext();
  });

  describe('listProducts', () => {
    it('should return all active products', async () => {
      await prisma.product.create({
        data: {
          name: 'Product 1',
          price: 100000,
          status: 'active' as any,
        },
      });
      await prisma.product.create({
        data: {
          name: 'Product 2',
          price: 200000,
          status: 'inactive' as any,
        },
      });

      req.query = {};
      await listProducts(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ name: 'Product 1' }),
          ]),
        })
      );
    });

    it('should filter by category', async () => {
      await prisma.product.create({
        data: {
          name: 'Product 1',
          price: 100000,
          category: 'Equipment',
          status: 'active' as any,
        },
      });

      req.query = { category: 'Equipment' };
      await listProducts(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ category: 'Equipment' }),
          ]),
        })
      );
    });
  });

  describe('getProduct', () => {
    it('should return product by id', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 100000,
          status: 'active' as any,
        },
      });

      req.params = { id: product.id.toString() };
      await getProduct(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ id: product.id }),
        })
      );
    });

    it('should return 404 if product not found', async () => {
      req.params = { id: '99999' };
      await getProduct(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      req.body = {
        name: 'New Product',
        price: 100000,
        stock: 10,
      };

      await createProduct(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ name: 'New Product' }),
        })
      );
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Original Product',
          price: 100000,
          status: 'active' as any,
        },
      });

      req.params = { id: product.id.toString() };
      req.body = { name: 'Updated Product' };

      await updateProduct(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ name: 'Updated Product' }),
        })
      );
    });
  });

  describe('deleteProduct', () => {
    it('should set product status to inactive', async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Product to Delete',
          price: 100000,
          status: 'active' as any,
        },
      });

      req.params = { id: product.id.toString() };
      await deleteProduct(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Sản phẩm đã bị xóa',
        })
      );
    });
  });
});
