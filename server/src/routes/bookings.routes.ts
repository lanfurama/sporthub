import { Router } from 'express';
import {
  createBooking,
  createAdminBooking,
  listBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookings.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/permission.middleware';

const router = Router();

router.post('/', optionalAuth, createBooking);
router.post('/admin', authenticate, requireMinRole('staff'), createAdminBooking);
router.get('/', authenticate, listBookings);
router.get('/:id', authenticate, getBooking);
router.patch('/:id/status', authenticate, requireMinRole('staff'), updateBookingStatus);
router.delete('/:id', authenticate, cancelBooking);

export default router;
