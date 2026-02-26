const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, getMe, logout } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');
const { body } = require('express-validator');

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to admin email
 * @access  Public
 */
router.post(
  '/send-otp',
  otpLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ],
  validate,
  sendOTP
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login
 * @access  Public
 */
router.post(
  '/verify-otp',
  authLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit number'),
  ],
  validate,
  verifyOTP
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current admin user
 * @access  Private
 */
router.get('/me', auth, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout admin
 * @access  Private
 */
router.post('/logout', auth, logout);

module.exports = router;
