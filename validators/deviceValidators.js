const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating a device
 */
const createDeviceValidation = [
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand must be between 2 and 50 characters'),
  
  body('name')
    .notEmpty()
    .withMessage('Device name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Device name must be between 2 and 100 characters'),
  
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Full name must be between 2 and 150 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('specifications.screenSize')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Screen size must not exceed 50 characters'),
  
  body('specifications.processor')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Processor must not exceed 100 characters'),
  
  body('specifications.camera')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Camera must not exceed 100 characters'),
  
  body('specifications.battery')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Battery must not exceed 50 characters'),
  
  body('specifications.releaseYear')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Release year must be between 2000 and 2100'),
];

/**
 * Validation rules for updating a device
 */
const updateDeviceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid device ID'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand must be between 2 and 50 characters'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Device name must be between 2 and 100 characters'),
  
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Full name must be between 2 and 150 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('specifications.screenSize')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Screen size must not exceed 50 characters'),
  
  body('specifications.processor')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Processor must not exceed 100 characters'),
  
  body('specifications.camera')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Camera must not exceed 100 characters'),
  
  body('specifications.battery')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Battery must not exceed 50 characters'),
  
  body('specifications.releaseYear')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Release year must be between 2000 and 2100'),
];

/**
 * Validation rules for device ID parameter
 */
const deviceIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid device ID'),
];

/**
 * Validation rules for device query parameters
 */
const deviceQueryValidation = [
  query('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand filter must not exceed 50 characters'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category filter must not exceed 50 characters'),
  
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive filter must be a boolean'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createDeviceValidation,
  updateDeviceValidation,
  deviceIdValidation,
  deviceQueryValidation,
};
