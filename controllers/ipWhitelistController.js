const IpWhitelist = require('../models/IpWhitelist');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get all whitelisted IPs
 * @route   GET /api/ip-whitelist
 * @access  Private
 */
exports.getAllWhitelistedIps = async (req, res) => {
  try {
    const ips = await IpWhitelist.find().sort({ createdAt: -1 });

    return successResponse(res, { ips }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get all whitelisted IPs error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get single whitelisted IP
 * @route   GET /api/ip-whitelist/:id
 * @access  Private
 */
exports.getWhitelistedIpById = async (req, res) => {
  try {
    const ip = await IpWhitelist.findById(req.params.id);

    if (!ip) {
      return errorResponse(
        res,
        'IP not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse(res, { ip }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get whitelisted IP by ID error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Add IP to whitelist
 * @route   POST /api/ip-whitelist
 * @access  Private
 */
exports.addIpToWhitelist = async (req, res) => {
  try {
    const { ip, label } = req.body;

    // Check if IP already exists
    const existingIp = await IpWhitelist.findOne({ ip });
    if (existingIp) {
      return errorResponse(
        res,
        'This IP is already whitelisted',
        HTTP_STATUS.CONFLICT
      );
    }

    const whitelistedIp = await IpWhitelist.create({
      ip,
      label: label || ip,
    });

    logger.info(`IP added to whitelist: ${ip}`);

    return successResponse(
      res,
      { ip: whitelistedIp, message: 'IP added to whitelist successfully' },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error(`Add IP to whitelist error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Update whitelisted IP
 * @route   PUT /api/ip-whitelist/:id
 * @access  Private
 */
exports.updateWhitelistedIp = async (req, res) => {
  try {
    const ip = await IpWhitelist.findById(req.params.id);

    if (!ip) {
      return errorResponse(
        res,
        'IP not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // If IP address is being changed, check for duplicates
    if (req.body.ip && req.body.ip !== ip.ip) {
      const existingIp = await IpWhitelist.findOne({ ip: req.body.ip });
      if (existingIp) {
        return errorResponse(
          res,
          'This IP is already whitelisted',
          HTTP_STATUS.CONFLICT
        );
      }
    }

    Object.assign(ip, req.body);
    await ip.save();

    logger.info(`Whitelisted IP updated: ${ip.ip}`);

    return successResponse(
      res,
      { ip, message: 'IP updated successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Update whitelisted IP error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Remove IP from whitelist
 * @route   DELETE /api/ip-whitelist/:id
 * @access  Private
 */
exports.removeIpFromWhitelist = async (req, res) => {
  try {
    const ip = await IpWhitelist.findById(req.params.id);

    if (!ip) {
      return errorResponse(
        res,
        'IP not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    await ip.deleteOne();

    logger.info(`IP removed from whitelist: ${ip.ip}`);

    return successResponse(
      res,
      { message: 'IP removed from whitelist successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Remove IP from whitelist error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Check if IP is whitelisted
 * @route   GET /api/ip-whitelist/check/:ip
 * @access  Private
 */
exports.checkIpWhitelisted = async (req, res) => {
  try {
    const { ip } = req.params;

    const whitelistedIp = await IpWhitelist.findOne({ ip });

    return successResponse(
      res,
      {
        ip,
        isWhitelisted: !!whitelistedIp,
        label: whitelistedIp?.label || null,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Check IP whitelisted error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
