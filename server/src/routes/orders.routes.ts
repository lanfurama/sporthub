import { Router } from 'express';
import { createOrder, listOrders, getOrder } from '../controllers/orders.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/permission.middleware';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/', authenticate, requireMinRole('staff'), listOrders);
router.get('/:id', authenticate, getOrder);

export default router;
