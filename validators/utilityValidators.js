const { body, param } = require('express-validator');

/**
 * Validation rules for creating a storage option
 */
const createStorageValidation = [
  body('name')
    .notEmpty()
    .withMessage('Storage name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Storage name must be between 2 and 50 characters'),
  
  body('value')
    .notEmpty()
    .withMessage('Storage value is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Storage value must be between 1 and 50 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation rules for creating a device condition
 */
const createConditionValidation = [
  body('name')
    .notEmpty()
    .withMessage('Condition name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Condition name must be between 2 and 50 characters'),
  
  body('value')
    .notEmpty()
    .withMessage('Condition value is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Condition value must be between 1 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation rules for creating a network
 */
const createNetworkValidation = [
  body('name')
    .notEmpty()
    .withMessage('Network name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Network name must be between 2 and 50 characters'),
  
  body('value')
    .notEmpty()
    .withMessage('Network value is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Network value must be between 1 and 50 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation rules for creating a brand
 */
const createBrandValidation = [
  body('name')
    .notEmpty()
    .withMessage('Brand name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand name must be between 2 and 50 characters'),
  
  body('logo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation rules for creating a category
 */
const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Generic update validation for utility items
 */
const updateUtilityValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('value')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Value must be between 1 and 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  
  body('logo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Validation for reordering utilities
 */
const reorderUtilitiesValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  
  body('items.*.id')
    .isMongoId()
    .withMessage('Each item must have a valid ID'),
  
  body('items.*.sortOrder')
    .isInt({ min: 0 })
    .withMessage('Each item must have a valid sort order'),
];

/**
 * Generic ID validation for utility routes
 */
const utilityIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
];

module.exports = {
  createStorageValidation,
  createConditionValidation,
  createNetworkValidation,
  createBrandValidation,
  createCategoryValidation,
  updateUtilityValidation,
  reorderUtilitiesValidation,
  utilityIdValidation,
};
