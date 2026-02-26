const Device = require('../models/Device');
const Pricing = require('../models/Pricing');
const importService = require('../services/importService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get all devices
 * @route   GET /api/devices
 * @access  Public
 */
exports.getAllDevices = async (req, res) => {
  try {
    const { brand, category, isActive, search } = req.query;

    const query = {};
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const devices = await Device.find(query).sort({ createdAt: -1 }).lean();

    return successResponse(res, { devices }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get all devices error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get single device by ID
 * @route   GET /api/devices/:id
 * @access  Public
 */
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return errorResponse(
        res,
        ERROR_MESSAGES.DEVICE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Get pricing for this device
    const pricing = await Pricing.find({ deviceId: device._id });

    return successResponse(
      res,
      { device, pricing },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get device by ID error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Create new device
 * @route   POST /api/devices
 * @access  Private
 */
exports.createDevice = async (req, res) => {
  try {
    const device = await Device.create(req.body);

    // Create default pricing entries if provided
    if (req.body.defaultPricing && req.body.defaultPricing.length > 0) {
      const pricingEntries = req.body.defaultPricing.map((pricing) => ({
        deviceId: device._id,
        deviceName: device.fullName,
        network: pricing.network,
        storage: pricing.storage,
        gradeNew: pricing.gradeNew,
        gradeGood: pricing.gradeGood,
        gradeBroken: pricing.gradeBroken,
      }));

      await Pricing.insertMany(pricingEntries);
    }

    logger.info(`Device created: ${device.fullName}`);

    return successResponse(
      res,
      { device, message: 'Device created successfully' },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error(`Create device error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Update device
 * @route   PUT /api/devices/:id
 * @access  Private
 */
exports.updateDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return errorResponse(
        res,
        ERROR_MESSAGES.DEVICE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    Object.assign(device, req.body);
    await device.save();

    // Update pricing if provided
    if (req.body.defaultPricing) {
      // Remove old pricing
      await Pricing.deleteMany({ deviceId: device._id });

      // Add new pricing
      if (req.body.defaultPricing.length > 0) {
        const pricingEntries = req.body.defaultPricing.map((pricing) => ({
          deviceId: device._id,
          deviceName: device.fullName,
          network: pricing.network,
          storage: pricing.storage,
          gradeNew: pricing.gradeNew,
          gradeGood: pricing.gradeGood,
          gradeBroken: pricing.gradeBroken,
        }));

        await Pricing.insertMany(pricingEntries);
      }
    }

    logger.info(`Device updated: ${device.fullName}`);

    return successResponse(
      res,
      { device, message: 'Device updated successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Update device error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Toggle device active status
 * @route   PATCH /api/devices/:id/toggle
 * @access  Private
 */
exports.toggleDeviceStatus = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return errorResponse(
        res,
        ERROR_MESSAGES.DEVICE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    device.isActive = !device.isActive;
    await device.save();

    logger.info(`Device status toggled: ${device.fullName} - ${device.isActive}`);

    return successResponse(
      res,
      { device, message: 'Device status updated successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Toggle device status error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Delete device
 * @route   DELETE /api/devices/:id
 * @access  Private
 */
exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return errorResponse(
        res,
        ERROR_MESSAGES.DEVICE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Delete associated pricing
    await Pricing.deleteMany({ deviceId: device._id });

    await device.deleteOne();

    logger.info(`Device deleted: ${device.fullName}`);

    return successResponse(
      res,
      { message: 'Device deleted successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Delete device error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Import devices from CSV
 * @route   POST /api/devices/import
 * @access  Private
 */
exports.importDevices = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(
        res,
        'No file uploaded',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const result = await importService.importDevicesFromCSV(req.file.path);

    logger.info(`Devices imported: ${result.imported} devices`);

    return successResponse(
      res,
      {
        message: 'Devices imported successfully',
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Import devices error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
