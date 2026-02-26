const Order = require('../models/Order');
const ApiLog = require('../models/ApiLog');
const IpWhitelist = require('../models/IpWhitelist');
const Device = require('../models/Device');
const Pricing = require('../models/Pricing');
const { HTTP_STATUS, ERROR_MESSAGES, ORDER_STATUSES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateRandomOrderNumber: generateOrderNumber } = require('../utils/orderNumberGenerator');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * @desc    External API endpoint for order creation (DecisionTech integration)
 * @route   POST /api/gateway/decisiontech
 * @access  IP Whitelisted
 */
exports.createExternalOrder = async (req, res) => {
  const startTime = Date.now();
  const sourceIp = req.ip || req.connection.remoteAddress;

  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      postage_method,
      bank_name,
      account_number,
      sort_code,
      device_id,
      device_name,
      network,
      offered_price,
      device_grade,
      storage,
      transaction_id,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'customer_name',
      'customer_phone',
      'customer_address',
      'device_name',
      'network',
      'device_grade',
      'offered_price',
      'postage_method',
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      await logApiRequest(
        req,
        422,
        false,
        null,
        `Missing required fields: ${missingFields.join(', ')}`,
        Date.now() - startTime
      );

      return errorResponse(
        res,
        `Missing required fields: ${missingFields.join(', ')}`,
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }

    // Validate device exists in database
    const device = await Device.findOne({ 
      fullName: device_name, 
      isActive: true 
    });

    if (!device) {
      const errorMsg = `Device not found: ${device_name}. Please use a valid device from our catalog.`;
      await logApiRequest(
        req,
        404,
        false,
        null,
        errorMsg,
        Date.now() - startTime
      );

      return errorResponse(
        res,
        errorMsg,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Validate network and storage combination exists in pricing
    if (storage) {
      const pricingEntry = await Pricing.findOne({
        deviceId: device._id,
        network: network,
        storage: storage,
      });

      if (!pricingEntry) {
        const errorMsg = `Invalid configuration: ${network} / ${storage} is not available for ${device_name}. Please check available options.`;
        await logApiRequest(
          req,
          400,
          false,
          null,
          errorMsg,
          Date.now() - startTime
        );

        return errorResponse(
          res,
          errorMsg,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Create order
    const orderData = {
      orderNumber: generateOrderNumber(),
      source: 'API',
      status: 'PENDING', // Uses first status from order status utilities
      customerName: customer_name,
      customerPhone: customer_phone,
      customerEmail: customer_email || '',
      customerAddress: customer_address,
      deviceName: device_name,
      network: network,
      deviceGrade: device_grade.toUpperCase(),
      storage: storage || 'Unknown',
      offeredPrice: parseFloat(offered_price),
      postageMethod: postage_method,
      paymentMethod: 'bank',
      paymentStatus: 'PENDING',
      payoutDetails: {
        accountName: bank_name || '',
        accountNumber: account_number || '',
        sortCode: sort_code || '',
      },
      transactionId: transaction_id || '',
    };

    // Only set deviceId if it's a valid MongoDB ObjectId
    if (device_id && /^[0-9a-fA-F]{24}$/.test(device_id)) {
      orderData.deviceId = device_id;
    }

    const order = await Order.create(orderData);

    // Send confirmation email if email provided
    if (customer_email) {
      await emailService.sendOrderConfirmation(order);
    }

    // Log successful request
    await logApiRequest(
      req,
      200,
      true,
      order.orderNumber,
      null,
      Date.now() - startTime
    );

    logger.info(`API Order created: ${order.orderNumber} from IP: ${sourceIp}`);

    return successResponse(
      res,
      {
        success: true,
        orderNumber: order.orderNumber,
        message: 'Order created successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          createdAt: order.createdAt,
        },
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error(`API Gateway error: ${error.message}`);

    // Log failed request
    await logApiRequest(
      req,
      500,
      false,
      null,
      error.message,
      Date.now() - startTime
    );

    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Helper function to log API requests
 */
async function logApiRequest(req, statusCode, success, orderNumber, error, responseTime) {
  try {
    const sourceIp = req.ip || req.connection.remoteAddress;

    await ApiLog.create({
      timestamp: new Date(),
      sourceIp,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      statusCode,
      success,
      orderNumber,
      payload: JSON.stringify(req.body),
      error,
      responseTime,
    });
  } catch (logError) {
    logger.error(`Failed to log API request: ${logError.message}`);
  }
}

/**
 * @desc    Test API endpoint
 * @route   POST /api/gateway/test
 * @access  IP Whitelisted
 */
exports.testEndpoint = async (req, res) => {
  try {
    const sourceIp = req.ip || req.connection.remoteAddress;

    return successResponse(
      res,
      {
        success: true,
        message: 'API Gateway is working',
        sourceIp,
        timestamp: new Date().toISOString(),
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`API test endpoint error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
