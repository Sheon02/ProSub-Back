import express from 'express';
import {
  sendWelcomeEmail,
  sendPasswordResetOTP,
  verifyOTP,
  resetPasswordWithOTP
} from '../controllers/emailController.js';

const router = express.Router();

router.post('/welcome', sendWelcomeEmail);
router.post('/send-otp', sendPasswordResetOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password',resetPasswordWithOTP)
export default router;