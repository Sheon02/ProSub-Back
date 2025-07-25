import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
   
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;