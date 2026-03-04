const Partner = require('../models/Partner');
const { HTTP_STATUS } = require('../config/constants');
const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Middleware to validate X-Partner-Key header on gateway endpoints.
 * Attaches the partner document to req.partner on success.
 */
const partnerAuth = async (req, res, next) => {
  try {
    const rawKey = req.headers['x-partner-key'];

    if (!rawKey) {
      return errorResponse(
        res,
        'Missing X-Partner-Key header. Please include your partner API key.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Find partner by verifying the hash of the supplied key
    const partners = await Partner.find({ isActive: true });
    const partner = partners.find(p => Partner.verifyKey(rawKey, p.keyHash));

    if (!partner) {
      logger.warn(`Invalid or inactive partner key attempt from IP: ${req.ip}`);
      return errorResponse(
        res,
        'Invalid or inactive partner API key.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Update last used timestamp and order count asynchronously
    Partner.findByIdAndUpdate(partner._id, { lastUsedAt: new Date() }).exec();

    req.partner = partner;
    next();
  } catch (error) {
    logger.error(`Partner auth middleware error: ${error.message}`);
    return errorResponse(res, 'Authentication error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

module.exports = partnerAuth;
