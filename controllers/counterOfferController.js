const CounterOffer = require('../models/CounterOffer');
const Order = require('../models/Order');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const crypto = require('crypto');

/**
 * Create a counter offer for an order
 */
exports.createCounterOffer = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { revisedPrice, reason, deviceImages } = req.body;

    // Validate required fields
    if (!revisedPrice || !reason) {
      return errorResponse(res, 'Revised price and reason are required', HTTP_STATUS.BAD_REQUEST);
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, 'Order not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if order already has a pending counter offer
    if (order.counterOffer?.hasCounterOffer && order.counterOffer?.status === 'PENDING') {
      return errorResponse(res, 'Order already has a pending counter offer', HTTP_STATUS.BAD_REQUEST);
    }

    // Generate unique review token
    const reviewToken = crypto.randomBytes(32).toString('hex');

    // Set expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create counter offer
    const counterOffer = await CounterOffer.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      originalPrice: order.offeredPrice,
      revisedPrice: parseFloat(revisedPrice),
      reason,
      deviceImages: deviceImages || [],
      expiresAt,
      reviewToken,
      createdBy: req.admin?.email || 'admin',
    });

    // Update order with counter offer info
    order.counterOffer = {
      hasCounterOffer: true,
      latestOfferId: counterOffer._id,
      status: 'PENDING',
    };
    order.status = 'COUNTER_OFFER_PENDING';
    await order.save();

    // Send email to customer
    if (order.customerEmail) {
      await emailService.sendCounterOfferEmail(order, counterOffer);
    }

    logger.info(`Counter offer created for order ${order.orderNumber}: £${order.offeredPrice} → £${revisedPrice}`);

    return successResponse(
      res,
      { counterOffer, message: 'Counter offer created and sent to customer' },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error(`Error creating counter offer: ${error.message}`);
    return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get counter offer by review token (for customer review page)
 */
exports.getCounterOfferByToken = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('[DEBUG] Looking up counter offer with token:', token);
    console.log('[DEBUG] Token length:', token.length);

    // First check if any counter offers exist
    const count = await CounterOffer.countDocuments();
    console.log('[DEBUG] Total counter offers in DB:', count);

    const counterOffer = await CounterOffer.findOne({ reviewToken: token }).populate('orderId');
    
    if (!counterOffer) {
      console.log('[DEBUG] Counter offer NOT FOUND for token:', token);
      // List all tokens in DB for debugging
      const allOffers = await CounterOffer.find({}, { reviewToken: 1, orderNumber: 1, status: 1 });
      console.log('[DEBUG] All counter offers in DB:', JSON.stringify(allOffers, null, 2));
      return errorResponse(res, 'Counter offer not found', HTTP_STATUS.NOT_FOUND);
    }

    console.log('[DEBUG] Counter offer FOUND:', counterOffer._id.toString(), 'for order:', counterOffer.orderNumber);

    // Check if expired
    if (counterOffer.isExpired() && counterOffer.status === 'PENDING') {
      return errorResponse(res, 'This counter offer has expired', HTTP_STATUS.GONE);
    }

    return successResponse(res, { counterOffer });
  } catch (error) {
    logger.error(`Error fetching counter offer: ${error.message}`);
    return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Customer accepts counter offer
 */
exports.acceptCounterOffer = async (req, res) => {
  try {
    const { token } = req.params;

    const counterOffer = await CounterOffer.findOne({ reviewToken: token });
    
    if (!counterOffer) {
      return errorResponse(res, 'Counter offer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if already responded
    if (counterOffer.status !== 'PENDING') {
      return errorResponse(res, 'Counter offer has already been responded to', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if expired
    if (counterOffer.isExpired()) {
      return errorResponse(res, 'This counter offer has expired', HTTP_STATUS.GONE);
    }

    // Update counter offer
    counterOffer.status = 'ACCEPTED';
    counterOffer.customerResponse = 'ACCEPTED';
    counterOffer.respondedAt = new Date();
    await counterOffer.save();

    // Update order
    const order = await Order.findById(counterOffer.orderId);
    if (order) {
      order.counterOffer.status = 'ACCEPTED';
      order.finalPrice = counterOffer.revisedPrice;
      order.status = 'COUNTER_OFFER_ACCEPTED';
      await order.save();

      // Send confirmation email
      if (order.customerEmail) {
        await emailService.sendCounterOfferAcceptedEmail(order, counterOffer);
      }
    }

    logger.info(`Counter offer accepted for order ${counterOffer.orderNumber}`);

    return successResponse(res, { message: 'Counter offer accepted successfully' });
  } catch (error) {
    logger.error(`Error accepting counter offer: ${error.message}`);
    return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Customer declines counter offer
 */
exports.declineCounterOffer = async (req, res) => {
  try {
    const { token } = req.params;
    const { feedback } = req.body;

    const counterOffer = await CounterOffer.findOne({ reviewToken: token });
    
    if (!counterOffer) {
      return errorResponse(res, 'Counter offer not found', HTTP_STATUS.NOT_FOUND);
    }

    // Check if already responded
    if (counterOffer.status !== 'PENDING') {
      return errorResponse(res, 'Counter offer has already been responded to', HTTP_STATUS.BAD_REQUEST);
    }

    // Check if expired
    if (counterOffer.isExpired()) {
      return errorResponse(res, 'This counter offer has expired', HTTP_STATUS.GONE);
    }

    // Update counter offer
    counterOffer.status = 'DECLINED';
    counterOffer.customerResponse = 'DECLINED';
    counterOffer.customerFeedback = feedback || '';
    counterOffer.respondedAt = new Date();
    await counterOffer.save();

    // Update order
    const order = await Order.findById(counterOffer.orderId);
    if (order) {
      order.counterOffer.status = 'DECLINED';
      order.status = 'CANCELLED';
      await order.save();

      // Send confirmation email
      if (order.customerEmail) {
        await emailService.sendCounterOfferDeclinedEmail(order, counterOffer);
      }
    }

    logger.info(`Counter offer declined for order ${counterOffer.orderNumber}`);

    return successResponse(res, { message: 'Counter offer declined successfully' });
  } catch (error) {
    logger.error(`Error declining counter offer: ${error.message}`);
    return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get all counter offers for an order (admin)
 */
exports.getOrderCounterOffers = async (req, res) => {
  try {
    const { orderId } = req.params;

    const counterOffers = await CounterOffer.find({ orderId }).sort({ createdAt: -1 });

    return successResponse(res, { counterOffers });
  } catch (error) {
    logger.error(`Error fetching counter offers: ${error.message}`);
    return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
