const { HTTP_STATUS, ERROR_MESSAGES, ADMIN_ROLES } = require('../config/constants');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Admin Role Authorization Middleware
 * Checks if authenticated user has required admin role
 */
const adminAuth = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated (auth middleware should run first)
    if (!req.admin) {
      return errorResponse(
        res,
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // If no specific roles provided, just check if admin exists
    if (roles.length === 0) {
      return next();
    }

    // Check if admin has required role
    if (!roles.includes(req.admin.role)) {
      return errorResponse(
        res,
        ERROR_MESSAGES.FORBIDDEN,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
};

/**
 * Super Admin Only Middleware
 */
const superAdminOnly = adminAuth(ADMIN_ROLES.SUPER_ADMIN);

/**
 * Admin and Super Admin Middleware
 */
const adminOnly = adminAuth(ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN);

module.exports = {
  adminAuth,
  superAdminOnly,
  adminOnly,
};
