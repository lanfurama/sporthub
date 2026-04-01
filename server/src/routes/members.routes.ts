import { Router } from 'express';
import {
  listMembers,
  getMember,
  createMember,
  addCredit,
} from '../controllers/members.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireMinRole } from '../middleware/permission.middleware';

const router = Router();

router.get('/', authenticate, requireMinRole('staff'), listMembers);
router.get('/:id', authenticate, getMember);
router.post('/', authenticate, requireMinRole('admin'), createMember);
router.post('/:id/credit', authenticate, requireMinRole('admin'), addCredit);

export default router;
