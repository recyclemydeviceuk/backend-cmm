const Order = require('../models/Order');
const Device = require('../models/Device');
const Pricing = require('../models/Pricing');
const exportService = require('../services/exportService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Export orders to CSV
 * @route   GET /api/export/orders
 * @access  Private
 */
exports.exportOrders = async (req, res) => {
  try {
    const { status, source, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    const csv = await exportService.exportOrdersToCSV(orders);

    const fileName = `orders_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    logger.info(`Orders exported: ${orders.length} orders`);

    return res.send(csv);
  } catch (error) {
    logger.error(`Export orders error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Export devices to CSV
 * @route   GET /api/export/devices
 * @access  Private
 */
exports.exportDevices = async (req, res) => {
  try {
    const { brand, category, isActive } = req.query;

    const query = {};
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const devices = await Device.find(query).sort({ brand: 1, name: 1 }).lean();

    // Get pricing for all devices
    const deviceIds = devices.map((d) => d._id);
    const pricingData = await Pricing.find({ deviceId: { $in: deviceIds } }).lean();

    // Map pricing to devices
    const devicesWithPricing = devices.map((device) => {
      const pricing = pricingData.filter((p) => p.deviceId.toString() === device._id.toString());
      return { ...device, pricing };
    });

    const csv = await exportService.exportDevicesToCSV(devicesWithPricing);

    const fileName = `devices_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    logger.info(`Devices exported: ${devices.length} devices`);

    return res.send(csv);
  } catch (error) {
    logger.error(`Export devices error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Export pricing to CSV
 * @route   GET /api/export/pricing
 * @access  Private
 */
exports.exportPricing = async (req, res) => {
  try {
    const { deviceId, network, storage } = req.query;

    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (network) query.network = network;
    if (storage) query.storage = storage;

    const pricing = await Pricing.find(query)
      .sort({ deviceName: 1, network: 1, storage: 1 })
      .lean();

    const csv = await exportService.exportPricingToCSV(pricing);

    const fileName = `pricing_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    logger.info(`Pricing exported: ${pricing.length} entries`);

    return res.send(csv);
  } catch (error) {
    logger.error(`Export pricing error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Export all data (orders, devices, pricing) as ZIP
 * @route   GET /api/export/all
 * @access  Private
 */
exports.exportAll = async (req, res) => {
  try {
    const [orders, devices, pricing] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).lean(),
      Device.find().sort({ brand: 1, name: 1 }).lean(),
      Pricing.find().sort({ deviceName: 1, network: 1, storage: 1 }).lean(),
    ]);

    // Get pricing for devices
    const deviceIds = devices.map((d) => d._id);
    const devicesWithPricing = devices.map((device) => {
      const devicePricing = pricing.filter((p) => p.deviceId.toString() === device._id.toString());
      return { ...device, pricing: devicePricing };
    });

    const zipBuffer = await exportService.exportAllDataToZip({
      orders,
      devices: devicesWithPricing,
      pricing,
    });

    const fileName = `cashmymobile_export_${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    logger.info(`All data exported: ${orders.length} orders, ${devices.length} devices, ${pricing.length} pricing entries`);

    return res.send(zipBuffer);
  } catch (error) {
    logger.error(`Export all data error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Export analytics report
 * @route   GET /api/export/analytics
 * @access  Private
 */
exports.exportAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [orders, statusBreakdown, deviceBreakdown, revenueData] = await Promise.all([
      Order.find(query).lean(),
      Order.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: query },
        { $group: { _id: '$deviceName', count: { $sum: 1 }, totalValue: { $sum: { $ifNull: ['$finalPrice', '$offeredPrice'] } } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Order.aggregate([
        { $match: { ...query, status: 'PAID' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$finalPrice', '$offeredPrice'] } }, count: { $sum: 1 } } },
      ]),
    ]);

    const analyticsData = {
      summary: {
        totalOrders: orders.length,
        totalRevenue: revenueData[0]?.total || 0,
        paidOrders: revenueData[0]?.count || 0,
        avgOrderValue: revenueData[0]?.count > 0 ? (revenueData[0].total / revenueData[0].count).toFixed(2) : 0,
      },
      statusBreakdown,
      topDevices: deviceBreakdown,
    };

    const csv = await exportService.exportAnalyticsToCSV(analyticsData);

    const fileName = `analytics_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    logger.info(`Analytics exported`);

    return res.send(csv);
  } catch (error) {
    logger.error(`Export analytics error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
