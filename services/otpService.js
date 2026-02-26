const crypto = require('crypto');
const OTP = require('../models/OTP');
const { OTP_CONFIG } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create and save OTP for email
 */
const createOTP = async (email) => {
  try {
    // Delete any existing unused OTPs for this email
    await OTP.deleteMany({ email, used: false });

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    // Save OTP to database
    const otp = await OTP.create({
      email,
      code,
      expiresAt,
      used: false,
    });

    logger.info(`OTP created for ${email}`);
    return code;
  } catch (error) {
    logger.error(`Error creating OTP:`, error.message);
    throw error;
  }
};

/**
 * Verify OTP for email
 */
const verifyOTP = async (email, code) => {
  try {
    // Find the most recent unused OTP for this email
    const otp = await OTP.findOne({
      email,
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      logger.warn(`Invalid or expired OTP attempt for ${email}`);
      return false;
    }

    // Mark OTP as used
    otp.used = true;
    await otp.save();

    logger.info(`OTP verified successfully for ${email}`);
    return true;
  } catch (error) {
    logger.error(`Error verifying OTP:`, error.message);
    throw error;
  }
};

/**
 * Clean up expired OTPs (call periodically)
 */
const cleanupExpiredOTPs = async () => {
  try {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    logger.info(`Cleaned up ${result.deletedCount} expired OTPs`);
    return result.deletedCount;
  } catch (error) {
    logger.error(`Error cleaning up expired OTPs:`, error.message);
    throw error;
  }
};

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  cleanupExpiredOTPs,
};
