import app from './server.js';
import { createServer } from 'http';
import mongoose from 'mongoose';

// Database connection cache
let isConnected = false;

export default async (req, res) => {
  try {
    // Database connection management
    if (!isConnected) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10
      });
      isConnected = true;
      console.log('Database connection established'.green.bold);
    }

    // Enhanced security headers
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

    // Create server instance
    const server = createServer(app);
    
    // Error handling
    server.on('error', (error) => {
      console.error('Server error:'.red.bold, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Start server
    return server.listen(req, res);
  } catch (error) {
    console.error('Initialization error:'.red.bold, error);
    if (!res.headersSent) {
      res.status(503).json({ error: 'Service unavailable' });
    }
  }
};