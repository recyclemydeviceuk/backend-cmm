const express = require('express');
const router = express.Router();
const {
  getAllApiLogs,
  getApiLogById,
  getApiLogStats,
  cleanupOldLogs,
} = require('../controllers/apiLogController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { param } = require('express-validator');

/**
 * @route   GET /api/api-logs/stats
 * @desc    Get API logs statistics
 * @access  Private
 */
router.get('/stats', auth, getApiLogStats);

/**
 * @route   GET /api/api-logs
 * @desc    Get all API logs with filters
 * @access  Private
 */
router.get('/', auth, getAllApiLogs);

/**
 * @route   GET /api/api-logs/:id
 * @desc    Get single API log by ID
 * @access  Private
 */
router.get(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid log ID')],
  validate,
  getApiLogById
);

/**
 * @route   DELETE /api/api-logs/cleanup
 * @desc    Delete old API logs
 * @access  Private
 */
router.delete('/cleanup', auth, cleanupOldLogs);

module.exports = router;
