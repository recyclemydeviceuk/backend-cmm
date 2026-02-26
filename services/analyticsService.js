const Order = require('../models/Order');
const Device = require('../models/Device');
const ApiLog = require('../models/ApiLog');
const logger = require('../utils/logger');

/**
 * Calculate dashboard statistics
 */
const calculateDashboardStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingOrders,
      totalRevenue,
      monthRevenue,
      totalDevices,
      activeDevices,
      apiRequests24h,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: thisWeek } }),
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ status: { $nin: ['PAID', 'CLOSED', 'CANCELLED'] } }),
      Order.aggregate([
        { $match: { status: { $in: ['COMPLETED', 'PAID'] } } },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$finalPrice', '$offeredPrice'] } },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: ['COMPLETED', 'PAID'] },
            createdAt: { $gte: thisMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$finalPrice', '$offeredPrice'] } },
          },
        },
      ]),
      Device.countDocuments(),
      Device.countDocuments({ isActive: true }),
      ApiLog.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    const stats = {
      orders: {
        total: totalOrders,
        today: todayOrders,
        week: weekOrders,
        month: monthOrders,
        pending: pendingOrders,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        month: monthRevenue[0]?.total || 0,
      },
      devices: {
        total: totalDevices,
        active: activeDevices,
      },
      api: {
        requests24h: apiRequests24h,
      },
    };

    logger.info('Dashboard stats calculated');
    return stats;
  } catch (error) {
    logger.error('Error calculating dashboard stats:', error.message);
    throw error;
  }
};

/**
 * Calculate order trends
 */
const calculateOrderTrends = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: { $ifNull: ['$finalPrice', '$offeredPrice'] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    logger.info(`Order trends calculated for ${days} days`);
    return trends;
  } catch (error) {
    logger.error('Error calculating order trends:', error.message);
    throw error;
  }
};

/**
 * Calculate device popularity
 */
const calculateDevicePopularity = async (limit = 10) => {
  try {
    const popularity = await Order.aggregate([
      {
        $group: {
          _id: '$deviceName',
          orderCount: { $sum: 1 },
          totalRevenue: {
            $sum: { $ifNull: ['$finalPrice', '$offeredPrice'] },
          },
          avgPrice: {
            $avg: { $ifNull: ['$finalPrice', '$offeredPrice'] },
          },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: limit },
    ]);

    logger.info(`Device popularity calculated (top ${limit})`);
    return popularity;
  } catch (error) {
    logger.error('Error calculating device popularity:', error.message);
    throw error;
  }
};

/**
 * Calculate conversion rates by source
 */
const calculateConversionRates = async () => {
  try {
    const rates = await Order.aggregate([
      {
        $group: {
          _id: '$source',
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $in: ['$status', ['PAID', 'CLOSED']] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          source: '$_id',
          total: 1,
          completed: 1,
          cancelled: 1,
          conversionRate: {
            $multiply: [{ $divide: ['$completed', '$total'] }, 100],
          },
          cancellationRate: {
            $multiply: [{ $divide: ['$cancelled', '$total'] }, 100],
          },
        },
      },
    ]);

    logger.info('Conversion rates calculated');
    return rates;
  } catch (error) {
    logger.error('Error calculating conversion rates:', error.message);
    throw error;
  }
};

/**
 * Calculate average order processing time
 */
const calculateProcessingTime = async () => {
  try {
    const completedOrders = await Order.find({
      status: { $in: ['PAID', 'CLOSED'] },
    })
      .select('createdAt updatedAt')
      .lean();

    if (completedOrders.length === 0) {
      return { avgDays: 0, avgHours: 0 };
    }

    const totalMs = completedOrders.reduce((sum, order) => {
      return sum + (new Date(order.updatedAt) - new Date(order.createdAt));
    }, 0);

    const avgMs = totalMs / completedOrders.length;
    const avgDays = avgMs / (1000 * 60 * 60 * 24);
    const avgHours = avgMs / (1000 * 60 * 60);

    logger.info('Processing time calculated');
    return { avgDays, avgHours, totalOrders: completedOrders.length };
  } catch (error) {
    logger.error('Error calculating processing time:', error.message);
    throw error;
  }
};

module.exports = {
  calculateDashboardStats,
  calculateOrderTrends,
  calculateDevicePopularity,
  calculateConversionRates,
  calculateProcessingTime,
};
