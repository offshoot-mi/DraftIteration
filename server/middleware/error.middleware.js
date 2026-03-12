// Rewrite/server/middleware/error.middleware.js
import AppError from '../utils/AppError.js';

// Handle 404 Not Found errors
const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Create a copy of the error object
  error.message = err.message; // Ensure message is copied

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥:', err);
    console.error('Stack:', err.stack);
  }


  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: '${value}' for field '${field}'. Please use another value.`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = messages.join('. ');
    error = new AppError(message, 400);
  }

  // JWT errors (already handled in auth.middleware, but as a fallback)
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired. Please log in again.', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    // Optionally include stack in development
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

export { notFound, errorHandler };