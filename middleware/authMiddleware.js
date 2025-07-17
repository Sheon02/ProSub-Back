import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Token blacklist (for immediate invalidation)
const tokenBlacklist = new Set();

export const protect = asyncHandler(async (req, res, next) => {
  // 1. Get token from multiple possible sources
  let token = req.cookies?.jwt || 
              req.headers['x-access-token'] || 
              (req.headers.authorization?.startsWith('Bearer') 
                ? req.headers.authorization.split(' ')[1] 
                : null);

  // 2. Verify token exists
  if (!token) {
    return res.status(401).json({ 
      success: false,
      code: 'NO_TOKEN',
      message: 'Authentication required - No token provided'
    });
  }

  // 3. Check token blacklist
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_REVOKED',
      message: 'Session expired - Please login again'
    });
  }

  try {
    // 4. Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Account not found - Please register'
      });
    }

    // 7. Attach user and token to request
    req.user = user;
    req.token = token;
    next();
    
  } catch (error) {
    // 8. Handle specific JWT errors
    let code = 'INVALID_TOKEN';
    let message = 'Invalid authentication';

    if (error.name === 'TokenExpiredError') {
      code = 'TOKEN_EXPIRED';
      message = 'Session expired - Please login again';
    } else if (error.name === 'JsonWebTokenError') {
      code = 'MALFORMED_TOKEN';
      message = 'Invalid authentication format';
    }

    res.status(401).json({ 
      success: false,
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        debug: error.message,
        stack: error.stack 
      })
    });
  }
});

export const admin = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      code: 'ADMIN_REQUIRED',
      message: 'Administrator privileges required'
    });
  }
};

// Helper function to revoke tokens
export const revokeToken = (token) => {
  tokenBlacklist.add(token);
  // Optional: Set timeout to auto-clear from blacklist after token expiry
  setTimeout(() => tokenBlacklist.delete(token), 
    parseInt(process.env.JWT_EXPIRY) || 3600000);
};

export { tokenBlacklist };