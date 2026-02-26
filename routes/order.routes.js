const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  bulkUpdateOrders,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');

/**
 * @route   GET /api/orders
 * @desc    Get all orders with filters
 * @access  Private
 */
router.get('/', auth, getAllOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  validate,
  getOrderById
);

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Public
 */
router.post(
  '/',
  orderLimiter,
  [
    body('customerName').notEmpty().trim().withMessage('Customer name is required'),
    body('customerPhone').notEmpty().trim().withMessage('Customer phone is required'),
    body('customerAddress').notEmpty().trim().withMessage('Customer address is required'),
    body('deviceName').notEmpty().trim().withMessage('Device name is required'),
    body('network').notEmpty().trim().withMessage('Network is required'),
    body('deviceGrade').isIn(['NEW', 'GOOD', 'BROKEN']).withMessage('Invalid device grade'),
    body('storage').notEmpty().trim().withMessage('Storage is required'),
    body('offeredPrice').isFloat({ min: 0 }).withMessage('Valid offered price is required'),
    body('postageMethod').isIn(['label', 'postbag']).withMessage('Invalid postage method'),
  ],
  validate,
  createOrder
);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  validate,
  updateOrder
);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.patch(
  '/:id/status',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status').notEmpty().withMessage('Status is required'),
  ],
  validate,
  updateOrderStatus
);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order
 * @access  Private
 */
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  validate,
  deleteOrder
);

/**
 * @route   POST /api/orders/bulk-update
 * @desc    Bulk update orders
 * @access  Private
 */
router.post(
  '/bulk-update',
  auth,
  [
    body('orderIds').isArray({ min: 1 }).withMessage('Order IDs array is required'),
    body('orderIds.*').isMongoId().withMessage('Invalid order ID in array'),
    body('updates').isObject().withMessage('Updates object is required'),
  ],
  validate,
  bulkUpdateOrders
);

module.exports = router;
