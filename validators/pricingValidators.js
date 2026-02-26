const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating pricing
 */
const createPricingValidation = [
  body('deviceId')
    .notEmpty()
    .withMessage('Device ID is required')
    .isMongoId()
    .withMessage('Invalid device ID'),
  
  body('deviceName')
    .notEmpty()
    .withMessage('Device name is required')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Device name must be between 2 and 150 characters'),
  
  body('network')
    .notEmpty()
    .withMessage('Network is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Network must be between 2 and 50 characters'),
  
  body('storage')
    .notEmpty()
    .withMessage('Storage is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Storage must be between 2 and 50 characters'),
  
  body('gradeNew')
    .notEmpty()
    .withMessage('NEW grade price is required')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('NEW grade price must be between 0 and 10000'),
  
  body('gradeGood')
    .notEmpty()
    .withMessage('GOOD grade price is required')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('GOOD grade price must be between 0 and 10000'),
  
  body('gradeBroken')
    .notEmpty()
    .withMessage('BROKEN grade price is required')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('BROKEN grade price must be between 0 and 10000'),
];

/**
 * Validation rules for updating pricing
 */
const updatePricingValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid pricing ID'),
  
  body('network')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Network must be between 2 and 50 characters'),
  
  body('storage')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Storage must be between 2 and 50 characters'),
  
  body('gradeNew')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('NEW grade price must be between 0 and 10000'),
  
  body('gradeGood')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('GOOD grade price must be between 0 and 10000'),
  
  body('gradeBroken')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('BROKEN grade price must be between 0 and 10000'),
];

/**
 * Validation rules for bulk update pricing
 */
const bulkUpdatePricingValidation = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('Updates must be a non-empty array'),
  
  body('updates.*.id')
    .isMongoId()
    .withMessage('Each update must have a valid pricing ID'),
  
  body('updates.*.gradeNew')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('NEW grade price must be between 0 and 10000'),
  
  body('updates.*.gradeGood')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('GOOD grade price must be between 0 and 10000'),
  
  body('updates.*.gradeBroken')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('BROKEN grade price must be between 0 and 10000'),
];

/**
 * Validation rules for getting a quote
 */
const getQuoteValidation = [
  query('deviceId')
    .notEmpty()
    .withMessage('Device ID is required')
    .isMongoId()
    .withMessage('Invalid device ID'),
  
  query('network')
    .notEmpty()
    .withMessage('Network is required')
    .trim(),
  
  query('storage')
    .notEmpty()
    .withMessage('Storage is required')
    .trim(),
  
  query('deviceGrade')
    .notEmpty()
    .withMessage('Device grade is required')
    .isIn(['NEW', 'GOOD', 'BROKEN'])
    .withMessage('Device grade must be NEW, GOOD, or BROKEN'),
];

/**
 * Validation rules for pricing ID parameter
 */
const pricingIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid pricing ID'),
];

/**
 * Validation rules for device ID parameter in pricing routes
 */
const deviceIdValidation = [
  param('deviceId')
    .isMongoId()
    .withMessage('Invalid device ID'),
];

module.exports = {
  createPricingValidation,
  updatePricingValidation,
  bulkUpdatePricingValidation,
  getQuoteValidation,
  pricingIdValidation,
  deviceIdValidation,
};
