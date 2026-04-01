import { Router } from 'express';
import {
  listCourts,
  getCourt,
  getCourtAvailability,
  createCourt,
  updateCourt,
  deleteCourt,
} from '../controllers/courts.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/permission.middleware';

const router = Router();

router.get('/', listCourts);
router.get('/:id', getCourt);
router.get('/:id/availability', getCourtAvailability);

router.post('/', authenticate, requireMinRole('admin'), createCourt);
router.patch('/:id', authenticate, requireMinRole('admin'), updateCourt);
router.delete('/:id', authenticate, requireMinRole('admin'), deleteCourt);

export default router;
