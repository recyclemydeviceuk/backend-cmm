const Admin = require('../models/Admin');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

/**
 * @desc    Send OTP to admin email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is authorized admin email
    const adminEmails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(email.toLowerCase())) {
      return errorResponse(
        res,
        ERROR_MESSAGES.EMAIL_NOT_AUTHORIZED,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Find or create admin user
    let admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      admin = await Admin.create({
        email: email.toLowerCase(),
        username: email.split('@')[0],
      });
    }

    // Generate and save OTP to database (with expiry)
    const otpCode = await otpService.createOTP(email.toLowerCase());

    // Send OTP via email
    await emailService.sendOTP(email, otpCode);

    logger.info(`OTP sent to ${email}`);

    return successResponse(
      res,
      { message: 'OTP sent successfully to your email' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Send OTP error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Verify OTP and login admin
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const isValid = await otpService.verifyOTP(email.toLowerCase(), otp);

    if (!isValid) {
      return errorResponse(
        res,
        ERROR_MESSAGES.INVALID_OTP,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Find admin user
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return errorResponse(
        res,
        ERROR_MESSAGES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    logger.info(`Admin logged in: ${email}`);

    return successResponse(
      res,
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          username: admin.username,
          role: admin.role,
        },
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Verify OTP error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get current admin user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-__v');

    if (!admin) {
      return errorResponse(
        res,
        ERROR_MESSAGES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse(res, { admin }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Logout admin
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // Optionally, you can implement token blacklisting here
    
    logger.info(`Admin logged out: ${req.admin.email}`);

    return successResponse(
      res,
      { message: 'Logged out successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
