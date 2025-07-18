import app from './server'; 
import mongoose from 'mongoose';

// Database connection management
let isConnected = false;

const connectDB = async () => {
  if (!isConnected) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10
      });
      isConnected = true;
      console.log('Database connection established'.green.bold);
    } catch (error) {
      console.error('Database connection failed:'.red.bold, error);
      throw error;
    }
  }
};

export default async (req, res) => {
  try {
    // Connect to database
    await connectDB();

    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      return res.status(204).end();
    }

    // Forward the request to your Express app
    return app(req, res);
    
  } catch (error) {
    console.error('Server error:'.red.bold, error);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
};