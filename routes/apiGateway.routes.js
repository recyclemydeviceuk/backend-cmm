const express = require('express');
const router = express.Router();
const { createExternalOrder, testEndpoint } = require('../controllers/apiGatewayController');
const ipWhitelist = require('../middleware/ipWhitelist');
const { gatewayLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');
const { body } = require('express-validator');

/**
 * @route   POST /api/gateway/decisiontech
 * @desc    External API endpoint for order creation
 * @access  IP Whitelisted
 */
router.post(
  '/decisiontech',
  ipWhitelist,
  gatewayLimiter,
  [
    body('customer_name').notEmpty().trim().withMessage('Customer name is required'),
    body('customer_phone').notEmpty().trim().withMessage('Customer phone is required'),
    body('customer_address').notEmpty().trim().withMessage('Customer address is required'),
    body('device_name').notEmpty().trim().withMessage('Device name is required'),
    body('network').notEmpty().trim().withMessage('Network is required'),
    body('device_grade').notEmpty().trim().withMessage('Device grade is required'),
    body('offered_price').isFloat({ min: 0 }).withMessage('Valid offered price is required'),
    body('postage_method').isIn(['label', 'postbag']).withMessage('Invalid postage method'),
  ],
  validate,
  createExternalOrder
);

/**
 * @route   POST /api/gateway/test
 * @desc    Test API endpoint
 * @access  IP Whitelisted
 */
router.post('/test', ipWhitelist, testEndpoint);

/**
 * @route   GET /api/gateway/test
 * @desc    Test API endpoint (GET)
 * @access  IP Whitelisted
 */
router.get('/test', ipWhitelist, testEndpoint);

module.exports = router;
