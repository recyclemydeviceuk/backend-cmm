const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating an order
 */
const createOrderValidation = [
  body('customerName')
    .notEmpty()
    .withMessage('Customer name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('customerPhone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .trim()
    .matches(/^(\+44|0)[0-9]{9,10}$/)
    .withMessage('Please provide a valid UK phone number'),
  
  body('customerEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .trim(),
  
  body('customerAddress')
    .notEmpty()
    .withMessage('Customer address is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  body('deviceName')
    .notEmpty()
    .withMessage('Device name is required')
    .trim(),
  
  body('network')
    .notEmpty()
    .withMessage('Network is required')
    .trim(),
  
  body('deviceGrade')
    .notEmpty()
    .withMessage('Device grade is required')
    .isIn(['NEW', 'GOOD', 'BROKEN'])
    .withMessage('Device grade must be NEW, GOOD, or BROKEN'),
  
  body('storage')
    .notEmpty()
    .withMessage('Storage is required')
    .trim(),
  
  body('offeredPrice')
    .notEmpty()
    .withMessage('Offered price is required')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Offered price must be a valid amount between 0 and 10000'),
  
  body('postageMethod')
    .notEmpty()
    .withMessage('Postage method is required')
    .isIn(['label', 'postbag'])
    .withMessage('Postage method must be either label or postbag'),
  
  body('deviceId')
    .optional()
    .isMongoId()
    .withMessage('Invalid device ID'),
];

/**
 * Validation rules for updating an order
 */
const updateOrderValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('customerPhone')
    .optional()
    .trim()
    .matches(/^(\+44|0)[0-9]{9,10}$/)
    .withMessage('Please provide a valid UK phone number'),
  
  body('customerEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('customerAddress')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  body('finalPrice')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Final price must be between 0 and 10000'),
  
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tracking number must not exceed 100 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes must not exceed 1000 characters'),
];

/**
 * Validation rules for updating order status
 */
const updateOrderStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'RECEIVED',
      'PACK_SENT',
      'DEVICE_RECEIVED',
      'INSPECTION_PASSED',
      'INSPECTION_FAILED',
      'PRICE_REVISED',
      'PAYOUT_READY',
      'PAID',
      'CLOSED',
      'CANCELLED',
    ])
    .withMessage('Invalid order status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

/**
 * Validation rules for bulk update orders
 */
const bulkUpdateOrdersValidation = [
  body('orderIds')
    .isArray({ min: 1 })
    .withMessage('Order IDs must be a non-empty array'),
  
  body('orderIds.*')
    .isMongoId()
    .withMessage('Each order ID must be valid'),
  
  body('updates')
    .isObject()
    .withMessage('Updates must be an object'),
];

/**
 * Validation rules for order query parameters
 */
const orderQueryValidation = [
  query('status')
    .optional()
    .isIn([
      'RECEIVED',
      'PACK_SENT',
      'DEVICE_RECEIVED',
      'INSPECTION_PASSED',
      'INSPECTION_FAILED',
      'PRICE_REVISED',
      'PAYOUT_READY',
      'PAID',
      'CLOSED',
      'CANCELLED',
    ])
    .withMessage('Invalid status filter'),
  
  query('source')
    .optional()
    .isIn(['WEBSITE', 'DECISIONTECH', 'CSV_IMPORT', 'MANUAL'])
    .withMessage('Invalid source filter'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'orderNumber', 'status'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

module.exports = {
  createOrderValidation,
  updateOrderValidation,
  updateOrderStatusValidation,
  bulkUpdateOrdersValidation,
  orderQueryValidation,
};
