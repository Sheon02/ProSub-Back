import Razorpay from 'razorpay';
import crypto from'crypto';
import dotenv from 'dotenv';

dotenv.config();
// console.log('Razorpay Key:', process.env.RAZORPAY_KEY_ID);
// console.log('Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (amount, currency = 'INR') => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
};

const verifyPayment = (razorpayResponse) => {
  try {
    const body = razorpayResponse.razorpay_order_id + "|" + razorpayResponse.razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    return expectedSignature === razorpayResponse.razorpay_signature;
  } catch (error) {
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

export default {
  createOrder,
  verifyPayment
};