const express = require('express');
const router = express.Router();
const {
  getAllWhitelistedIps,
  getWhitelistedIpById,
  addIpToWhitelist,
  updateWhitelistedIp,
  removeIpFromWhitelist,
  checkIpWhitelisted,
} = require('../controllers/ipWhitelistController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');

/**
 * @route   GET /api/ip-whitelist
 * @desc    Get all whitelisted IPs
 * @access  Private
 */
router.get('/', auth, getAllWhitelistedIps);

/**
 * @route   GET /api/ip-whitelist/check/:ip
 * @desc    Check if IP is whitelisted
 * @access  Private
 */
router.get(
  '/check/:ip',
  auth,
  [param('ip').isIP().withMessage('Invalid IP address')],
  validate,
  checkIpWhitelisted
);

/**
 * @route   GET /api/ip-whitelist/:id
 * @desc    Get single whitelisted IP
 * @access  Private
 */
router.get(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid ID')],
  validate,
  getWhitelistedIpById
);

/**
 * @route   POST /api/ip-whitelist
 * @desc    Add IP to whitelist
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('ip').isIP().withMessage('Valid IP address is required'),
    body('label').notEmpty().trim().withMessage('Label is required'),
  ],
  validate,
  addIpToWhitelist
);

/**
 * @route   PUT /api/ip-whitelist/:id
 * @desc    Update whitelisted IP
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid ID')],
  validate,
  updateWhitelistedIp
);

/**
 * @route   DELETE /api/ip-whitelist/:id
 * @desc    Remove IP from whitelist
 * @access  Private
 */
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid ID')],
  validate,
  removeIpFromWhitelist
);

module.exports = router;
