const express = require('express');
const router = express.Router();
const {
  getAllPricing,
  getPricingByDevice,
  getQuote,
  createPricing,
  updatePricing,
  bulkUpdatePricing,
  deletePricing,
} = require('../controllers/pricingController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');

/**
 * @route   GET /api/pricing
 * @desc    Get all pricing entries
 * @access  Public
 */
router.get('/', getAllPricing);

/**
 * @route   GET /api/pricing/device/:deviceId
 * @desc    Get pricing for specific device
 * @access  Public
 */
router.get(
  '/device/:deviceId',
  [param('deviceId').isMongoId().withMessage('Invalid device ID')],
  validate,
  getPricingByDevice
);

/**
 * @route   GET /api/pricing/quote
 * @desc    Get quote for device configuration
 * @access  Public
 */
router.get('/quote', getQuote);

/**
 * @route   POST /api/pricing
 * @desc    Create pricing entry
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('deviceId').isMongoId().withMessage('Invalid device ID'),
    body('deviceName').notEmpty().trim().withMessage('Device name is required'),
    body('network').notEmpty().trim().withMessage('Network is required'),
    body('storage').notEmpty().trim().withMessage('Storage is required'),
    body('gradeNew').isFloat({ min: 0 }).withMessage('Valid NEW grade price is required'),
    body('gradeGood').isFloat({ min: 0 }).withMessage('Valid GOOD grade price is required'),
    body('gradeBroken').isFloat({ min: 0 }).withMessage('Valid BROKEN grade price is required'),
  ],
  validate,
  createPricing
);

/**
 * @route   PUT /api/pricing/:id
 * @desc    Update pricing entry
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid pricing ID')],
  validate,
  updatePricing
);

/**
 * @route   POST /api/pricing/bulk-update
 * @desc    Bulk update pricing
 * @access  Private
 */
router.post(
  '/bulk-update',
  auth,
  [
    body('updates').isArray({ min: 1 }).withMessage('Updates array is required'),
    body('updates.*.id').isMongoId().withMessage('Invalid pricing ID'),
  ],
  validate,
  bulkUpdatePricing
);

/**
 * @route   DELETE /api/pricing/:id
 * @desc    Delete pricing entry
 * @access  Private
 */
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid pricing ID')],
  validate,
  deletePricing
);

module.exports = router;
