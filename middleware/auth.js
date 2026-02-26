const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches admin user to request
 */
const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return errorResponse(
        res,
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find admin user
      const admin = await Admin.findById(decoded.id).select('-__v');

      if (!admin) {
        return errorResponse(
          res,
          'Admin user not found',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (!admin.isActive) {
        return errorResponse(
          res,
          'Admin account is inactive',
          HTTP_STATUS.FORBIDDEN
        );
      }

      // Attach admin to request
      req.admin = admin;

      next();
    } catch (error) {
      logger.error(`JWT verification error: ${error.message}`);
      return errorResponse(
        res,
        'Invalid or expired token',
        HTTP_STATUS.UNAUTHORIZED
      );
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return errorResponse(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = auth;
