// Rewrite/server/utils/AppError.js

/**
 * Custom error class to create operational errors with a status code.
 */
class AppError extends Error {
  /**
   * @param {string} message The error message.
   * @param {number} statusCode The HTTP status code for this error.
   */
  constructor(message, statusCode) {
    super(message); // Call the parent constructor (Error)

    this.statusCode = statusCode;
    // Determine if the status code indicates a 'fail' (4xx) or 'error' (5xx)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Operational errors are trusted errors (e.g., user input error), not programming errors
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;