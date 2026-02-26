const Order = require('../models/Order');
const Device = require('../models/Device');
const ApiLog = require('../models/ApiLog');
const analyticsService = require('../services/analyticsService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await analyticsService.calculateDashboardStats();

    return successResponse(res, { stats }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get dashboard stats error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get recent orders for dashboard
 * @route   GET /api/dashboard/recent-orders
 * @access  Private
 */
exports.getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('orderNumber status source customerName deviceName offeredPrice finalPrice createdAt')
      .lean();

    return successResponse(res, { orders }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get recent orders error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get order status breakdown
 * @route   GET /api/dashboard/status-breakdown
 * @access  Private
 */
exports.getStatusBreakdown = async (req, res) => {
  try {
    const breakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const total = await Order.countDocuments();

    const breakdownWithPercentage = breakdown.map((item) => ({
      status: item._id,
      count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : 0,
    }));

    return successResponse(
      res,
      {
        breakdown: breakdownWithPercentage,
        total,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get status breakdown error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get revenue analytics
 * @route   GET /api/dashboard/revenue
 * @access  Private
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [totalRevenue, paidOrders, avgOrderValue] = await Promise.all([
      Order.aggregate([
        { $match: { ...query, status: { $in: ['COMPLETED', 'PAID'] } } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ['$finalPrice', '$offeredPrice'],
              },
            },
          },
        },
      ]),
      Order.countDocuments({ ...query, status: { $in: ['COMPLETED', 'PAID'] } }),
      Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            avg: {
              $avg: {
                $ifNull: ['$finalPrice', '$offeredPrice'],
              },
            },
          },
        },
      ]),
    ]);

    return successResponse(
      res,
      {
        totalRevenue: totalRevenue[0]?.total || 0,
        paidOrders,
        avgOrderValue: avgOrderValue[0]?.avg?.toFixed(2) || 0,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get revenue analytics error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get orders over time (chart data)
 * @route   GET /api/dashboard/orders-over-time
 * @access  Private
 */
exports.getOrdersOverTime = async (req, res) => {
  try {
    const { period = '30days' } = req.query;

    let groupBy = { $dayOfYear: '$createdAt' };
    let daysBack = 30;

    if (period === '7days') {
      daysBack = 7;
    } else if (period === '90days') {
      daysBack = 90;
    } else if (period === '1year') {
      daysBack = 365;
      groupBy = { $month: '$createdAt' };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const ordersOverTime = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          date: { $first: '$createdAt' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return successResponse(
      res,
      {
        period,
        data: ordersOverTime,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get orders over time error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get top devices
 * @route   GET /api/dashboard/top-devices
 * @access  Private
 */
exports.getTopDevices = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topDevices = await Order.aggregate([
      {
        $group: {
          _id: '$deviceName',
          count: { $sum: 1 },
          totalValue: {
            $sum: {
              $ifNull: ['$finalPrice', '$offeredPrice'],
            },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    return successResponse(
      res,
      { topDevices },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get top devices error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
