import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, paymentMethod, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      totalPrice,
      paymentMethod,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered with subscription details
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.subscriptionDetails = {
      accountEmail: req.body.accountEmail,
      accountPassword: req.body.accountPassword,
      activationCode: req.body.activationCode,
      expiryDate: req.body.expiryDate,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get undelivered orders with subscription products
// @route   GET /api/orders/undelivered
// @access  Private/Admin
const getUndeliveredOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ isDelivered: false })
    .populate('user', 'email')
    .populate('orderItems.product', 'name price');
  
  res.json(orders);
});

// @desc    Get orders by user email
// @route   GET /api/orders/user/:email
// @access  Private/Admin
const getOrdersByUserEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const orders = await Order.find({ user: user._id })
    .populate('orderItems.product', 'name price');
  
  res.json(orders);
});

// @desc    Update subscription details
// @route   PUT /api/orders/:id/subscription
// @access  Private/Admin
const updateSubscriptionDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.subscriptionDetails = {
      ...order.subscriptionDetails,
      ...req.body
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.product', 'name price image');
  res.json(orders);
  console.log("Fetching orders for user:", req.user._id); 
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name email')
    .populate('orderItems.product', 'name price');
  res.json(orders);
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await order.remove();
    res.json({ message: 'Order removed' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getUndeliveredOrders,
  getOrdersByUserEmail,
  updateSubscriptionDetails,
  getMyOrders,
  getOrders,
  deleteOrder,
};