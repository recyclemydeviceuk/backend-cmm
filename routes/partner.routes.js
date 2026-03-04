const express = require('express');
const router = express.Router();
const {
  getAllPartners,
  createPartner,
  regenerateKey,
  togglePartner,
  deletePartner,
} = require('../controllers/partnerController');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validator');

/**
 * @route   GET /api/partners
 * @desc    Get all partners
 * @access  Private
 */
router.get('/', auth, getAllPartners);

/**
 * @route   POST /api/partners
 * @desc    Create new partner + generate API key
 * @access  Private
 */
router.post(
  '/',
  auth,
  [body('name').notEmpty().trim().withMessage('Partner name is required')],
  validate,
  createPartner
);

/**
 * @route   POST /api/partners/:id/regenerate
 * @desc    Regenerate API key for partner
 * @access  Private
 */
router.post(
  '/:id/regenerate',
  auth,
  [param('id').isMongoId().withMessage('Invalid partner ID')],
  validate,
  regenerateKey
);

/**
 * @route   PATCH /api/partners/:id/toggle
 * @desc    Enable/disable partner
 * @access  Private
 */
router.patch(
  '/:id/toggle',
  auth,
  [param('id').isMongoId().withMessage('Invalid partner ID')],
  validate,
  togglePartner
);

/**
 * @route   DELETE /api/partners/:id
 * @desc    Delete partner
 * @access  Private
 */
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid partner ID')],
  validate,
  deletePartner
);

module.exports = router;
