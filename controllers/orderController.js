const Order = require('../models/Order');
const orderService = require('../services/orderService');
const emailService = require('../services/emailService');
const { HTTP_STATUS, ERROR_MESSAGES, ORDER_STATUSES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { generateRandomOrderNumber: generateOrderNumber } = require('../utils/orderNumberGenerator');

/**
 * @desc    Get all orders with filters
 * @route   GET /api/orders
 * @access  Private
 */
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      source,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { deviceName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Order.countDocuments(query);

    return successResponse(
      res,
      {
        orders,
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
    logger.error(`Get all orders error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return errorResponse(
        res,
        ERROR_MESSAGES.ORDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse(res, { order }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get order by ID error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Create new order (from website)
 * @route   POST /api/orders
 * @access  Public
 */
exports.createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      orderNumber: generateOrderNumber(),
      source: 'WEBSITE',
      status: 'PENDING',
    };

    const order = await Order.create(orderData);

    logger.info(`Order created: ${order.orderNumber}`);

    return successResponse(
      res,
      { order, message: 'Order created successfully' },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error(`Create order error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Update order
 * @route   PUT /api/orders/:id
 * @access  Private
 */
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return errorResponse(
        res,
        ERROR_MESSAGES.ORDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Track changes for email notifications
    const oldStatus = order.status;
    const newStatus = req.body.status;
    const oldFinalPrice = order.finalPrice || order.offeredPrice;
    const newFinalPrice = req.body.finalPrice;

    // Update order
    Object.assign(order, req.body);
    
    // Auto-update paymentStatus based on order status
    if (newStatus === 'COMPLETED') {
      order.paymentStatus = 'PAID';
    } else if (newStatus && newStatus !== 'COMPLETED') {
      order.paymentStatus = 'PENDING';
    }
    
    await order.save();

    // Send completion email if status changed to COMPLETED (non-blocking)
    if (oldStatus !== newStatus && newStatus === 'COMPLETED') {
      emailService.sendOrderCompletionEmail(order).catch(err => {
        logger.warn(`Failed to send order completion email for ${order.orderNumber}: ${err.message}`);
      });
    }

    // Send price revision email if finalPrice changed and reason provided (non-blocking)
    if (newFinalPrice && newFinalPrice !== oldFinalPrice && order.priceRevisionReason) {
      emailService.sendPriceRevisionEmail(order, oldFinalPrice, newFinalPrice, order.priceRevisionReason).catch(err => {
        logger.warn(`Failed to send price revision email for ${order.orderNumber}: ${err.message}`);
      });
    }

    logger.info(`Order updated: ${order.orderNumber}`);

    return successResponse(
      res,
      { order, message: 'Order updated successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Update order error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 * @access  Private
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return errorResponse(
        res,
        ERROR_MESSAGES.ORDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const oldStatus = order.status;
    order.status = status;
    
    // Auto-update paymentStatus based on order status
    if (status === 'COMPLETED') {
      order.paymentStatus = 'PAID';
    } else {
      order.paymentStatus = 'PENDING';
    }
    
    await order.save();

    // Send completion email if status changed to COMPLETED (non-blocking)
    if (status === 'COMPLETED') {
      emailService.sendOrderCompletionEmail(order).catch(err => {
        logger.warn(`Failed to send order completion email for ${order.orderNumber}: ${err.message}`);
      });
    }

    logger.info(`Order status updated: ${order.orderNumber} - ${oldStatus} -> ${status}`);

    return successResponse(
      res,
      { order, message: 'Order status updated successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Update order status error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Delete order
 * @route   DELETE /api/orders/:id
 * @access  Private
 */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return errorResponse(
        res,
        ERROR_MESSAGES.ORDER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    await order.deleteOne();

    logger.info(`Order deleted: ${order.orderNumber}`);

    return successResponse(
      res,
      { message: 'Order deleted successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Delete order error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Bulk update orders
 * @route   POST /api/orders/bulk-update
 * @access  Private
 */
exports.bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, updates } = req.body;

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: updates }
    );

    logger.info(`Bulk update: ${result.modifiedCount} orders updated`);

    return successResponse(
      res,
      {
        message: `${result.modifiedCount} orders updated successfully`,
        modifiedCount: result.modifiedCount,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Bulk update orders error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
