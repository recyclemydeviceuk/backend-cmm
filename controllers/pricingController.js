const Pricing = require('../models/Pricing');
const Device = require('../models/Device');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get all pricing entries
 * @route   GET /api/pricing
 * @access  Public
 */
exports.getAllPricing = async (req, res) => {
  try {
    const { deviceId, network, storage } = req.query;

    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (network) query.network = network;
    if (storage) query.storage = storage;

    const pricing = await Pricing.find(query).sort({ deviceName: 1, network: 1, storage: 1 });

    return successResponse(res, { pricing }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get all pricing error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get pricing for specific device
 * @route   GET /api/pricing/device/:deviceId
 * @access  Public
 */
exports.getPricingByDevice = async (req, res) => {
  try {
    const pricing = await Pricing.find({ deviceId: req.params.deviceId });

    return successResponse(res, { pricing }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get pricing by device error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get quote for device configuration
 * @route   GET /api/pricing/quote
 * @access  Public
 */
exports.getQuote = async (req, res) => {
  try {
    const { deviceId, network, storage, grade } = req.query;

    if (!deviceId || !network || !storage || !grade) {
      return errorResponse(
        res,
        'Missing required parameters',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const pricing = await Pricing.findOne({
      deviceId,
      network,
      storage,
    });

    if (!pricing) {
      return errorResponse(
        res,
        'Pricing not found for this configuration',
        HTTP_STATUS.NOT_FOUND
      );
    }

    const gradeField = `grade${grade.charAt(0).toUpperCase() + grade.slice(1).toLowerCase()}`;
    const price = pricing[gradeField];

    return successResponse(
      res,
      {
        price,
        deviceName: pricing.deviceName,
        network: pricing.network,
        storage: pricing.storage,
        grade,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get quote error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Create pricing entry
 * @route   POST /api/pricing
 * @access  Private
 */
exports.createPricing = async (req, res) => {
  try {
    const pricing = await Pricing.create(req.body);

    logger.info(`Pricing entry created for ${pricing.deviceName}`);

    return successResponse(
      res,
      { pricing, message: 'Pricing entry created successfully' },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error(`Create pricing error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Update pricing entry
 * @route   PUT /api/pricing/:id
 * @access  Private
 */
exports.updatePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findById(req.params.id);

    if (!pricing) {
      return errorResponse(
        res,
        'Pricing entry not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    Object.assign(pricing, req.body);
    pricing.updatedAt = Date.now();
    await pricing.save();

    logger.info(`Pricing entry updated for ${pricing.deviceName}`);

    return successResponse(
      res,
      { pricing, message: 'Pricing entry updated successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Update pricing error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Bulk update pricing
 * @route   POST /api/pricing/bulk-update
 * @access  Private
 */
exports.bulkUpdatePricing = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, gradeNew, gradeGood, gradeBroken }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: {
          $set: {
            gradeNew: update.gradeNew,
            gradeGood: update.gradeGood,
            gradeBroken: update.gradeBroken,
            updatedAt: Date.now(),
          },
        },
      },
    }));

    const result = await Pricing.bulkWrite(bulkOps);

    logger.info(`Bulk pricing update: ${result.modifiedCount} entries updated`);

    return successResponse(
      res,
      {
        message: `${result.modifiedCount} pricing entries updated successfully`,
        modifiedCount: result.modifiedCount,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Bulk update pricing error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Delete pricing entry
 * @route   DELETE /api/pricing/:id
 * @access  Private
 */
exports.deletePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findById(req.params.id);

    if (!pricing) {
      return errorResponse(
        res,
        'Pricing entry not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    await pricing.deleteOne();

    logger.info(`Pricing entry deleted for ${pricing.deviceName}`);

    return successResponse(
      res,
      { message: 'Pricing entry deleted successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Delete pricing error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
