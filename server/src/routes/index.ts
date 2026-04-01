import { Router } from 'express';
import authRoutes from './auth.routes';
import courtRoutes from './courts.routes';
import bookingRoutes from './bookings.routes';
import memberRoutes from './members.routes';
import planRoutes from './plans.routes';
import productRoutes from './products.routes';
import orderRoutes from './orders.routes';
import analyticsRoutes from './analytics.routes';
import paymentRoutes from './payments.routes';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/members', memberRoutes);
router.use('/plans', planRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payments', paymentRoutes);
