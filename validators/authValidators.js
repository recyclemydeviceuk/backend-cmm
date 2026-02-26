const { body } = require('express-validator');

/**
 * Validation rules for sending OTP
 */
const sendOTPValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .trim(),
];

/**
 * Validation rules for verifying OTP
 */
const verifyOTPValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .trim(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
    .trim(),
];

module.exports = {
  sendOTPValidation,
  verifyOTPValidation,
};
