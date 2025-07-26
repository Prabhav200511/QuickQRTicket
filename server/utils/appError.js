// utils/appError.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Factory function to create an AppError instance
const appError = (message, statusCode) => new AppError(message, statusCode);

module.exports = { AppError, appError };
