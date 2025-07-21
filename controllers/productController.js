import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc    Fetch all products (no pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i', // Case-insensitive search
        },
      }
    : {};

  // Fetch all products matching the keyword (no pagination)
  const products = await Product.find({ ...keyword });

  res.json(products); // Returns array of products directly
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted' });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    image,
    description,
    isActive
  } = req.body;

  const product = new Product({
    name,
    price,
    user: req.user._id,
    image,
    description,
    isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    platform: 'default' // Add default platform or make it optional in your model
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.platform = req.body.platform || product.platform;
    product.duration = req.body.duration || product.duration;
    product.countInStock = req.body.countInStock || product.countInStock;
    product.description = req.body.description || product.description;

    product.image = req.body.image || product.image;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Toggle product status to active
// @route   PUT /api/products/toggleon/:id
// @access  Private/Admin
const toggleProductOn = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.isActive = true;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Toggle product status to inactive
// @route   PUT /api/products/toggleoff/:id
// @access  Private/Admin
const toggleProductOff = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.isActive = false;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});


export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  toggleProductOn,
  toggleProductOff
};