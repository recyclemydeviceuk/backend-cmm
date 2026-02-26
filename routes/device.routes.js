const express = require('express');
const router = express.Router();
const {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  toggleDeviceStatus,
  deleteDevice,
  importDevices,
} = require('../controllers/deviceController');
const auth = require('../middleware/auth');
const { uploadCSV } = require('../middleware/upload');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');

/**
 * @route   GET /api/devices
 * @desc    Get all devices
 * @access  Public
 */
router.get('/', getAllDevices);

/**
 * @route   GET /api/devices/:id
 * @desc    Get single device by ID
 * @access  Public
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid device ID')],
  validate,
  getDeviceById
);

/**
 * @route   POST /api/devices
 * @desc    Create new device
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('brand').notEmpty().trim().withMessage('Brand is required'),
    body('name').notEmpty().trim().withMessage('Device name is required'),
    body('fullName').notEmpty().trim().withMessage('Full name is required'),
    body('category').notEmpty().trim().withMessage('Category is required'),
  ],
  validate,
  createDevice
);

/**
 * @route   PUT /api/devices/:id
 * @desc    Update device
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid device ID')],
  validate,
  updateDevice
);

/**
 * @route   PATCH /api/devices/:id/toggle
 * @desc    Toggle device active status
 * @access  Private
 */
router.patch(
  '/:id/toggle',
  auth,
  [param('id').isMongoId().withMessage('Invalid device ID')],
  validate,
  toggleDeviceStatus
);

/**
 * @route   DELETE /api/devices/:id
 * @desc    Delete device
 * @access  Private
 */
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid device ID')],
  validate,
  deleteDevice
);

/**
 * @route   POST /api/devices/import
 * @desc    Import devices from CSV
 * @access  Private
 */
router.post('/import', auth, uploadCSV, importDevices);

module.exports = router;
