const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXXX
 */
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `ORD-${year}${month}${day}`;

  // Find the last order number for today
  const lastOrder = await Order.findOne({
    orderNumber: new RegExp(`^${datePrefix}`),
  })
    .sort({ createdAt: -1 })
    .select('orderNumber');

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  const orderNumber = `${datePrefix}-${String(sequence).padStart(5, '0')}`;
  return orderNumber;
};

/**
 * Calculate order value based on final or offered price
 */
const calculateOrderValue = (order) => {
  return order.finalPrice || order.offeredPrice || 0;
};

/**
 * Get order statistics for a date range
 */
const getOrderStatistics = async (startDate, endDate) => {
  try {
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [total, byStatus, bySource, totalValue] = await Promise.all([
      Order.countDocuments(query),
      Order.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: query },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$finalPrice', '$offeredPrice'] } },
          },
        },
      ]),
    ]);

    return {
      total,
      byStatus,
      bySource,
      totalValue: totalValue[0]?.total || 0,
    };
  } catch (error) {
    logger.error(`Error getting order statistics: ${error.message}`);
    throw error;
  }
};

/**
 * Check if order status transition is valid
 */
const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    RECEIVED: ['PACK_SENT', 'CANCELLED'],
    PACK_SENT: ['DEVICE_RECEIVED', 'CANCELLED'],
    DEVICE_RECEIVED: ['INSPECTION_PASSED', 'INSPECTION_FAILED', 'CANCELLED'],
    INSPECTION_PASSED: ['PAYOUT_READY', 'PRICE_REVISED'],
    INSPECTION_FAILED: ['PRICE_REVISED', 'CANCELLED', 'CLOSED'],
    PRICE_REVISED: ['PAYOUT_READY', 'CANCELLED'],
    PAYOUT_READY: ['PAID'],
    PAID: ['CLOSED'],
    CANCELLED: [],
    CLOSED: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get orders by customer
 */
const getOrdersByCustomer = async (emailOrPhone) => {
  try {
    const orders = await Order.find({
      $or: [{ customerEmail: emailOrPhone }, { customerPhone: emailOrPhone }],
    }).sort({ createdAt: -1 });

    return orders;
  } catch (error) {
    logger.error(`Error getting orders by customer: ${error.message}`);
    throw error;
  }
};

/**
 * Get pending orders (not completed or cancelled)
 */
const getPendingOrders = async () => {
  try {
    const orders = await Order.find({
      status: { $nin: ['PAID', 'CLOSED', 'CANCELLED'] },
    }).sort({ createdAt: -1 });

    return orders;
  } catch (error) {
    logger.error(`Error getting pending orders: ${error.message}`);
    throw error;
  }
};

/**
 * Search orders by various criteria
 */
const searchOrders = async (searchTerm) => {
  try {
    const orders = await Order.find({
      $or: [
        { orderNumber: new RegExp(searchTerm, 'i') },
        { customerName: new RegExp(searchTerm, 'i') },
        { customerEmail: new RegExp(searchTerm, 'i') },
        { customerPhone: new RegExp(searchTerm, 'i') },
        { deviceName: new RegExp(searchTerm, 'i') },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return orders;
  } catch (error) {
    logger.error(`Error searching orders: ${error.message}`);
    throw error;
  }
};

/**
 * Get orders requiring action (stuck in a status for too long)
 */
const getOrdersRequiringAction = async (daysInStatus = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInStatus);

    const orders = await Order.find({
      status: { $nin: ['PAID', 'CLOSED', 'CANCELLED'] },
      updatedAt: { $lt: cutoffDate },
    }).sort({ updatedAt: 1 });

    return orders;
  } catch (error) {
    logger.error(`Error getting orders requiring action: ${error.message}`);
    throw error;
  }
};

/**
 * Calculate completion rate
 */
const calculateCompletionRate = async (startDate, endDate) => {
  try {
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [total, completed, cancelled] = await Promise.all([
      Order.countDocuments(query),
      Order.countDocuments({ ...query, status: { $in: ['PAID', 'CLOSED'] } }),
      Order.countDocuments({ ...query, status: 'CANCELLED' }),
    ]);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;

    return {
      total,
      completed,
      cancelled,
      completionRate: completionRate.toFixed(2),
      cancellationRate: cancellationRate.toFixed(2),
    };
  } catch (error) {
    logger.error(`Error calculating completion rate: ${error.message}`);
    throw error;
  }
};

module.exports = {
  generateOrderNumber,
  calculateOrderValue,
  getOrderStatistics,
  isValidStatusTransition,
  getOrdersByCustomer,
  getPendingOrders,
  searchOrders,
  getOrdersRequiringAction,
  calculateCompletionRate,
};
