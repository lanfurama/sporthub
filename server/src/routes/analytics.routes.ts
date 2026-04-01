import { Router } from 'express';
import { getDashboard } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/permission.middleware';

const router = Router();

router.get('/dashboard', authenticate, requireMinRole('staff'), getDashboard);

export default router;
