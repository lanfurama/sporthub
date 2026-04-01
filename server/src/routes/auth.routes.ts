import { Router } from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  refresh,
  adminLogin,
  verify2FA,
  googleAuth,
  googleCallback,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refresh);
router.post('/admin/login', adminLogin);
router.post('/admin/verify-2fa', verify2FA);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
