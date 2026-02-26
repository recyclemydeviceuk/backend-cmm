const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentOrders,
  getStatusBreakdown,
  getRevenueAnalytics,
  getOrdersOverTime,
  getTopDevices,
} = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', auth, getDashboardStats);

/**
 * @route   GET /api/dashboard/recent-orders
 * @desc    Get recent orders for dashboard
 * @access  Private
 */
router.get('/recent-orders', auth, getRecentOrders);

/**
 * @route   GET /api/dashboard/status-breakdown
 * @desc    Get order status breakdown
 * @access  Private
 */
router.get('/status-breakdown', auth, getStatusBreakdown);

/**
 * @route   GET /api/dashboard/revenue
 * @desc    Get revenue analytics
 * @access  Private
 */
router.get('/revenue', auth, getRevenueAnalytics);

/**
 * @route   GET /api/dashboard/orders-over-time
 * @desc    Get orders over time (chart data)
 * @access  Private
 */
router.get('/orders-over-time', auth, getOrdersOverTime);

/**
 * @route   GET /api/dashboard/top-devices
 * @desc    Get top devices
 * @access  Private
 */
router.get('/top-devices', auth, getTopDevices);

module.exports = router;
