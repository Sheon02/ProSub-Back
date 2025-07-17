import express from 'express';
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  toggleProductOn,
  toggleProductOff
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

// Product routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/toggleon/:id')
  .put(protect, admin, toggleProductOn);

router.route('/toggleoff/:id')
  .put(protect, admin, toggleProductOff);

router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router;