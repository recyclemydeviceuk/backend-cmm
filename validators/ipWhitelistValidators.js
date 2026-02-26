const { body, param } = require('express-validator');

/**
 * Validation rules for adding IP to whitelist
 */
const addIpValidation = [
  body('ip')
    .notEmpty()
    .withMessage('IP address is required')
    .isIP()
    .withMessage('Please provide a valid IP address (IPv4 or IPv6)'),
  
  body('label')
    .notEmpty()
    .withMessage('Label is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Label must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation rules for updating whitelisted IP
 */
const updateIpValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
  
  body('ip')
    .optional()
    .isIP()
    .withMessage('Please provide a valid IP address (IPv4 or IPv6)'),
  
  body('label')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Label must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation for IP whitelist ID parameter
 */
const ipIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
];

/**
 * Validation for checking IP parameter
 */
const checkIpValidation = [
  param('ip')
    .notEmpty()
    .withMessage('IP address is required')
    .isIP()
    .withMessage('Please provide a valid IP address (IPv4 or IPv6)'),
];

module.exports = {
  addIpValidation,
  updateIpValidation,
  ipIdValidation,
  checkIpValidation,
};
