const IpWhitelist = require('../models/IpWhitelist');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * IP Whitelist Middleware
 * Checks if request IP is whitelisted for API gateway access
 */
const ipWhitelist = async (req, res, next) => {
  try {
    // Get client IP
    const clientIp = 
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip;

    // Clean IP (remove ::ffff: prefix for IPv4-mapped IPv6 addresses)
    const cleanIp = clientIp.replace(/^::ffff:/, '');

    // Development mode - allow localhost
    if (process.env.NODE_ENV === 'development') {
      if (cleanIp === '127.0.0.1' || cleanIp === 'localhost' || cleanIp === '::1') {
        logger.info(`Dev mode: Allowing localhost IP: ${cleanIp}`);
        return next();
      }
    }

    // Check if IP is whitelisted
    const whitelistedIp = await IpWhitelist.findOne({ 
      ip: cleanIp,
      isActive: true 
    });

    if (!whitelistedIp) {
      logger.warn(`IP not whitelisted: ${cleanIp}`);
      return errorResponse(
        res,
        ERROR_MESSAGES.IP_NOT_WHITELISTED,
        HTTP_STATUS.FORBIDDEN
      );
    }

    logger.info(`Whitelisted IP access: ${cleanIp} (${whitelistedIp.label})`);
    
    // Attach IP info to request
    req.whitelistedIp = {
      ip: cleanIp,
      label: whitelistedIp.label,
    };

    next();
  } catch (error) {
    logger.error(`IP whitelist middleware error: ${error.message}`);
    return errorResponse(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = ipWhitelist;
