const express = require('express');
const router = express.Router();
const {
  exportOrders,
  exportDevices,
  exportPricing,
  exportAll,
  exportAnalytics,
} = require('../controllers/exportController');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/export/orders
 * @desc    Export orders to CSV
 * @access  Private
 */
router.get('/orders', auth, exportOrders);

/**
 * @route   GET /api/export/devices
 * @desc    Export devices to CSV
 * @access  Private
 */
router.get('/devices', auth, exportDevices);

/**
 * @route   GET /api/export/pricing
 * @desc    Export pricing to CSV
 * @access  Private
 */
router.get('/pricing', auth, exportPricing);

/**
 * @route   GET /api/export/all
 * @desc    Export all data as ZIP
 * @access  Private
 */
router.get('/all', auth, exportAll);

/**
 * @route   GET /api/export/analytics
 * @desc    Export analytics report
 * @access  Private
 */
router.get('/analytics', auth, exportAnalytics);

module.exports = router;
