const crypto = require('crypto');

/**
 * Order number generator utility
 * Generates unique order numbers with various formats
 */

/**
 * Generate order number with date prefix
 * Format: ORD-YYYYMMDD-XXXXX
 */
const generateDateBasedOrderNumber = (sequence = 1) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `ORD-${year}${month}${day}`;
  const sequenceStr = String(sequence).padStart(5, '0');

  return `${datePrefix}-${sequenceStr}`;
};

/**
 * Generate random order number
 * Format: ORD-XXXXXX (6 random chars)
 */
const generateRandomOrderNumber = () => {
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${randomStr}`;
};

/**
 * Generate UUID-based order number
 * Format: ORD-UUID
 */
const generateUUIDOrderNumber = () => {
  const uuid = crypto.randomUUID();
  return `ORD-${uuid}`;
};

/**
 * Generate timestamp-based order number
 * Format: ORD-TIMESTAMP-RANDOM
 */
const generateTimestampOrderNumber = () => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generate short order number
 * Format: ORDXXXXXX (6 digits)
 */
const generateShortOrderNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD${random}`;
};

/**
 * Validate order number format
 */
const validateOrderNumber = (orderNumber) => {
  // Check if order number starts with ORD
  if (!orderNumber || !orderNumber.startsWith('ORD')) {
    return false;
  }

  // Check minimum length
  if (orderNumber.length < 6) {
    return false;
  }

  return true;
};

/**
 * Extract date from date-based order number
 */
const extractDateFromOrderNumber = (orderNumber) => {
  // Format: ORD-YYYYMMDD-XXXXX
  const parts = orderNumber.split('-');
  if (parts.length !== 3 || parts[0] !== 'ORD') {
    return null;
  }

  const dateStr = parts[1];
  if (dateStr.length !== 8) {
    return null;
  }

  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));

  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Extract sequence from date-based order number
 */
const extractSequenceFromOrderNumber = (orderNumber) => {
  // Format: ORD-YYYYMMDD-XXXXX
  const parts = orderNumber.split('-');
  if (parts.length !== 3 || parts[0] !== 'ORD') {
    return null;
  }

  return parseInt(parts[2]);
};

/**
 * Generate next order number based on last order number
 */
const generateNextOrderNumber = (lastOrderNumber) => {
  if (!lastOrderNumber || !validateOrderNumber(lastOrderNumber)) {
    return generateDateBasedOrderNumber(1);
  }

  const lastDate = extractDateFromOrderNumber(lastOrderNumber);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If last order is from a different day, start new sequence
  if (!lastDate || lastDate.getTime() !== today.getTime()) {
    return generateDateBasedOrderNumber(1);
  }

  // Same day, increment sequence
  const lastSequence = extractSequenceFromOrderNumber(lastOrderNumber);
  return generateDateBasedOrderNumber(lastSequence + 1);
};

module.exports = {
  generateDateBasedOrderNumber,
  generateRandomOrderNumber,
  generateUUIDOrderNumber,
  generateTimestampOrderNumber,
  generateShortOrderNumber,
  validateOrderNumber,
  extractDateFromOrderNumber,
  extractSequenceFromOrderNumber,
  generateNextOrderNumber,
};
