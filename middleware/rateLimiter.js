const rateLimit = require('express-rate-limit');
const { HTTP_STATUS, RATE_LIMIT, ERROR_MESSAGES } = require('../config/constants');

/**
 * General API Rate Limiter
 * Default: 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * Strict Rate Limiter for Authentication
 * 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * OTP Request Limiter
 * 3 OTP requests per 10 minutes
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    error: 'Too many OTP requests. Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Contact Form Limiter
 * 3 submissions per hour
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: 'Too many contact form submissions. Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Order Creation Limiter
 * 10 orders per hour (for public API)
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: 'Too many order submissions. Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API Gateway Limiter
 * 100 requests per hour for external API
 */
const gatewayLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: {
    success: false,
    error: 'API rate limit exceeded. Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP for rate limiting
    return req.ip || req.connection.remoteAddress;
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  contactLimiter,
  orderLimiter,
  gatewayLimiter,
};
