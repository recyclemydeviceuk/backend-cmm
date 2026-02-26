const ApiLog = require('../models/ApiLog');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get all API logs with filters
 * @route   GET /api/api-logs
 * @access  Private
 */
exports.getAllApiLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      success,
      sourceIp,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Apply filters
    if (success !== undefined) query.success = success === 'true';
    if (sourceIp) query.sourceIp = sourceIp;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const logs = await ApiLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ApiLog.countDocuments(query);

    return successResponse(
      res,
      {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get all API logs error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get single API log by ID
 * @route   GET /api/api-logs/:id
 * @access  Private
 */
exports.getApiLogById = async (req, res) => {
  try {
    const log = await ApiLog.findById(req.params.id);

    if (!log) {
      return errorResponse(
        res,
        'API log not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse(res, { log }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get API log by ID error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get API logs statistics
 * @route   GET /api/api-logs/stats
 * @access  Private
 */
exports.getApiLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [totalRequests, successfulRequests, failedRequests, avgResponseTime, bySourceIp] = await Promise.all([
      ApiLog.countDocuments(query),
      ApiLog.countDocuments({ ...query, success: true }),
      ApiLog.countDocuments({ ...query, success: false }),
      ApiLog.aggregate([
        { $match: query },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } },
      ]),
      ApiLog.aggregate([
        { $match: query },
        { $group: { _id: '$sourceIp', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return successResponse(
      res,
      {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : 0,
        avgResponseTime: avgResponseTime[0]?.avgResponseTime?.toFixed(2) || 0,
        topSourceIps: bySourceIp,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get API log stats error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Delete old API logs
 * @route   DELETE /api/api-logs/cleanup
 * @access  Private
 */
exports.cleanupOldLogs = async (req, res) => {
  try {
    const { daysOld = 90 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    const result = await ApiLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    logger.info(`Cleaned up ${result.deletedCount} old API logs`);

    return successResponse(
      res,
      {
        message: `Deleted ${result.deletedCount} logs older than ${daysOld} days`,
        deletedCount: result.deletedCount,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Cleanup old logs error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
