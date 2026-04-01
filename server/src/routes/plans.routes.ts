import { Router } from 'express';
import { listPlans } from '../controllers/plans.controller';

const router = Router();

router.get('/', listPlans);

export default router;
