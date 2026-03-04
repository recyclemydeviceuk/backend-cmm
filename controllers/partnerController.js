const Partner = require('../models/Partner');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get all partners
 * @route   GET /api/partners
 * @access  Private
 */
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 }).select('-keyHash');
    return successResponse(res, { partners }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get partners error: ${error.message}`);
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Create a new partner and generate API key
 * @route   POST /api/partners
 * @access  Private
 */
exports.createPartner = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 'Partner name is required', HTTP_STATUS.BAD_REQUEST);
    }

    const existing = await Partner.findOne({ name: name.trim() });
    if (existing) {
      return errorResponse(res, 'A partner with this name already exists', HTTP_STATUS.CONFLICT);
    }

    const { plainKey, keyHash, keyPrefix } = Partner.generateKey();

    const partner = await Partner.create({
      name: name.trim(),
      keyHash,
      keyPrefix,
      createdBy: req.admin._id,
    });

    logger.info(`Partner created: ${partner.name} by admin ${req.admin.email}`);

    return successResponse(
      res,
      {
        partner: {
          id: partner._id,
          name: partner.name,
          keyPrefix: partner.keyPrefix,
          isActive: partner.isActive,
          createdAt: partner.createdAt,
        },
        apiKey: plainKey,
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error(`Create partner error: ${error.message}`);
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Regenerate API key for a partner
 * @route   POST /api/partners/:id/regenerate
 * @access  Private
 */
exports.regenerateKey = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return errorResponse(res, 'Partner not found', HTTP_STATUS.NOT_FOUND);
    }

    const { plainKey, keyHash, keyPrefix } = Partner.generateKey();

    partner.keyHash = keyHash;
    partner.keyPrefix = keyPrefix;
    await partner.save();

    logger.info(`Partner key regenerated: ${partner.name} by admin ${req.admin.email}`);

    return successResponse(
      res,
      {
        partner: {
          id: partner._id,
          name: partner.name,
          keyPrefix: partner.keyPrefix,
          isActive: partner.isActive,
          createdAt: partner.createdAt,
        },
        apiKey: plainKey,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Regenerate key error: ${error.message}`);
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Toggle partner active status
 * @route   PATCH /api/partners/:id/toggle
 * @access  Private
 */
exports.togglePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return errorResponse(res, 'Partner not found', HTTP_STATUS.NOT_FOUND);
    }

    partner.isActive = !partner.isActive;
    await partner.save();

    logger.info(`Partner ${partner.isActive ? 'enabled' : 'disabled'}: ${partner.name}`);

    return successResponse(
      res,
      {
        partner: {
          id: partner._id,
          name: partner.name,
          keyPrefix: partner.keyPrefix,
          isActive: partner.isActive,
          totalOrders: partner.totalOrders,
          lastUsedAt: partner.lastUsedAt,
          createdAt: partner.createdAt,
        },
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Toggle partner error: ${error.message}`);
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @desc    Delete a partner
 * @route   DELETE /api/partners/:id
 * @access  Private
 */
exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return errorResponse(res, 'Partner not found', HTTP_STATUS.NOT_FOUND);
    }

    await partner.deleteOne();

    logger.info(`Partner deleted: ${partner.name} by admin ${req.admin.email}`);

    return successResponse(res, { message: 'Partner deleted successfully' }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Delete partner error: ${error.message}`);
    return errorResponse(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
