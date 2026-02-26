const { body } = require('express-validator');

/**
 * Validation rules for external API order creation (DecisionTech)
 */
const createExternalOrderValidation = [
  body('customer_name')
    .notEmpty()
    .withMessage('Customer name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('customer_phone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .trim()
    .matches(/^(\+44|0)[0-9]{9,10}$/)
    .withMessage('Please provide a valid UK phone number'),
  
  body('customer_email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .trim(),
  
  body('customer_address')
    .notEmpty()
    .withMessage('Customer address is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  body('device_name')
    .notEmpty()
    .withMessage('Device name is required')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Device name must be between 2 and 150 characters'),
  
  body('network')
    .notEmpty()
    .withMessage('Network is required')
    .trim(),
  
  body('device_grade')
    .notEmpty()
    .withMessage('Device grade is required')
    .trim()
    .isIn(['NEW', 'GOOD', 'BROKEN', 'new', 'good', 'broken'])
    .withMessage('Device grade must be NEW, GOOD, or BROKEN'),
  
  body('storage')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Storage must not exceed 50 characters'),
  
  body('offered_price')
    .notEmpty()
    .withMessage('Offered price is required')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Offered price must be between 0 and 10000'),
  
  body('postage_method')
    .notEmpty()
    .withMessage('Postage method is required')
    .isIn(['label', 'postbag'])
    .withMessage('Postage method must be either label or postbag'),
  
  body('device_id')
    .optional()
    .isMongoId()
    .withMessage('Invalid device ID'),
  
  body('reference_id')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference ID must not exceed 100 characters'),
];

module.exports = {
  createExternalOrderValidation,
};
