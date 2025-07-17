import express from 'express';
const router = express.Router();
import paymentController  from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js'; 

router.post('/orders', protect, paymentController.createPaymentOrder);
router.post('/verify', protect, paymentController.verifyPayment);

export default router;