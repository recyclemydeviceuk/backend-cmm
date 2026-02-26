const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.message = message;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error.statusCode = HTTP_STATUS.CONFLICT;
    error.message = message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error.statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    error.message = message;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.message = 'Token expired';
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.message = 'File size too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.message = 'Too many files';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.message = 'Unexpected field';
    } else {
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.message = err.message;
    }
  }

  // Send error response
  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
};

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
