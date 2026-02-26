const logger = require('../utils/logger');

/**
 * Request Logger Middleware
 * Logs all incoming HTTP requests
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    logger[logLevel](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.connection.remoteAddress,
    });
  });

  next();
};

/**
 * Admin Request Logger
 * Logs admin-specific actions with additional details
 */
const adminRequestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log admin request
  logger.info(`[ADMIN] ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    admin: req.admin?.email || 'Unknown',
    adminId: req.admin?._id?.toString() || 'Unknown',
    ip: req.ip || req.connection.remoteAddress,
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`[ADMIN] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      admin: req.admin?.email || 'Unknown',
      ip: req.ip || req.connection.remoteAddress,
    });
  });

  next();
};

module.exports = {
  requestLogger,
  adminRequestLogger,
};
