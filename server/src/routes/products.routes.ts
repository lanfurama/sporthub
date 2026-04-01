import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/permission.middleware';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

router.post('/', authenticate, requireMinRole('admin'), createProduct);
router.patch('/:id', authenticate, requireMinRole('admin'), updateProduct);
router.delete('/:id', authenticate, requireMinRole('admin'), deleteProduct);

export default router;
