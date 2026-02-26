const { validationResult } = require('express-validator');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Validation Result Handler Middleware
 * Checks express-validator results and returns errors if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: errorMessages,
    });
  }

  next();
};

/**
 * Sanitize Request Body
 * Removes potentially dangerous fields from request body
 */
const sanitizeBody = (...allowedFields) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return next();
    }

    // If no allowed fields specified, allow all
    if (allowedFields.length === 0) {
      return next();
    }

    // Filter body to only include allowed fields
    const sanitized = {};
    allowedFields.forEach((field) => {
      if (req.body.hasOwnProperty(field)) {
        sanitized[field] = req.body[field];
      }
    });

    req.body = sanitized;
    next();
  };
};

/**
 * Prevent MongoDB Operator Injection
 * Removes $ and . from object keys
 */
const preventMongoInjection = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (let key in obj) {
      // Remove keys starting with $ or containing .
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  };

  // Sanitize body, query, and params
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

module.exports = {
  validate,
  sanitizeBody,
  preventMongoInjection,
};
