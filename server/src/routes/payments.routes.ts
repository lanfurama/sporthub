import { Router } from 'express';
import { createPayment, vnpayWebhook, momoWebhook } from '../controllers/payments.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', optionalAuth, createPayment);
router.get('/webhook', vnpayWebhook);
router.post('/webhook', momoWebhook);

export default router;
