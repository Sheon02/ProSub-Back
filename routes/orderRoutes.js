import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  getUndeliveredOrders,
  getOrdersByUserEmail,
  updateSubscriptionDetails,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Base order routes
router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders)
  .get(protect,getOrders);

// Undelivered orders route
router.route('/undelivered')
  .get(protect, admin, getUndeliveredOrders);

// User's personal orders
router.route('/myorders')
  .get(protect, getMyOrders);

// Orders by user email
router.route('/user/:email')
  .get(protect, admin, getOrdersByUserEmail);

// Single order operations
router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);

// Order payment
router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

// Order delivery
router.route('/:id/deliver')
  .put(protect, admin, updateOrderToDelivered);

// Subscription management
router.route('/:id/subscription')
  .put(protect, admin, updateSubscriptionDetails);

export default router;