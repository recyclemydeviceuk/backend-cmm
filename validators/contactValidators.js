const { body, param } = require('express-validator');

/**
 * Validation rules for submitting contact form
 */
const submitContactValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .trim(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+44|0)[0-9]{9,10}$/)
    .withMessage('Please provide a valid UK phone number'),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
];

/**
 * Validation rules for updating contact submission status
 */
const updateContactStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid submission ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['new', 'in_progress', 'resolved', 'closed'])
    .withMessage('Status must be new, in_progress, resolved, or closed'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes must not exceed 1000 characters'),
];

/**
 * Validation for contact submission ID parameter
 */
const contactIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid submission ID'),
];

module.exports = {
  submitContactValidation,
  updateContactStatusValidation,
  contactIdValidation,
};
