import paymentService from '../services/paymentService.js';
import Order from '../models/orderModel.js'; 

const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const order = await paymentService.createOrder(amount, currency);
    res.json(order);
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpayResponse, orderDetails } = req.body;
    
    if (!razorpayResponse || !orderDetails) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const isVerified = paymentService.verifyPayment(razorpayResponse);
    
    if (!isVerified) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Create order in database
    const newOrder = new Order({
      user: req.user._id, // Assuming you have user auth
      orderId: razorpayResponse.razorpay_order_id,
      paymentId: razorpayResponse.razorpay_payment_id,
      items: orderDetails.cartItems,
      totalAmount: orderDetails.amount / 100, // Convert back to rupees
      customerEmail: orderDetails.customerEmail,
      status: 'completed'
    });

    await newOrder.save();

    res.json({ 
      success: true,
      paymentId: razorpayResponse.razorpay_payment_id,
      orderId: razorpayResponse.razorpay_order_id,
      order: newOrder
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  createPaymentOrder,
  verifyPayment
};