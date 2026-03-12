// Rewrite/server/middleware/
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';

// Middleware to protect routes that require authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header (format: "Bearer <token>")
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID from the token's payload
      // Exclude the passwordHash from being returned
      // Also ensure the user is not deleted
      req.user = await User.findOne({ _id: decoded.id, status: 'active' }).select('-passwordHash');

      if (!req.user) {
        return next(new AppError('No active user found with this token', 401));
      }
      next(); // Proceed to the next middleware or controller
    } catch (error) {
      console.error('Tokenauth.middleware.js verification failed:', error.message);
      return next(new AppError('Not authorized, token failed', 401));
    }
  }

  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401));
  }
});

// Middleware to authorize users based on role (e.g., 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(`User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

// Specific admin authorization middleware for convenience
const admin = authorize('admin');

export { protect, admin, authorize };