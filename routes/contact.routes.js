const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
} = require('../controllers/contactController');
const auth = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post(
  '/',
  contactLimiter,
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').notEmpty().trim().withMessage('Subject is required'),
    body('message').notEmpty().trim().withMessage('Message is required'),
  ],
  validate,
  submitContactForm
);

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions
 * @access  Private
 */
router.get('/', auth, getAllSubmissions);

/**
 * @route   GET /api/contact/:id
 * @desc    Get single contact submission
 * @access  Private
 */
router.get(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid submission ID')],
  validate,
  getSubmissionById
);

/**
 * @route   PATCH /api/contact/:id/status
 * @desc    Update contact submission status
 * @access  Private
 */
router.patch(
  '/:id/status',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid submission ID'),
    body('status')
      .isIn(['new', 'in_progress', 'resolved', 'closed'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateSubmissionStatus
);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete contact submission
 * @access  Private
 */
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid submission ID')],
  validate,
  deleteSubmission
);

module.exports = router;
