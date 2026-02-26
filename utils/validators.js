/**
 * Custom validation utility functions
 * Additional validators beyond express-validator
 */

/**
 * Validate UK postcode
 */
const isValidUKPostcode = (postcode) => {
  const regex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  return regex.test(postcode);
};

/**
 * Validate credit card number (Luhn algorithm)
 */
const isValidCreditCard = (cardNumber) => {
  const sanitized = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(sanitized)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate password strength
 */
const isStrongPassword = (password, minLength = 8) => {
  if (password.length < minLength) {
    return {
      valid: false,
      message: `Password must be at least ${minLength} characters`,
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { valid: true, message: 'Password is strong' };
};

/**
 * Validate IMEI number
 */
const isValidIMEI = (imei) => {
  const sanitized = imei.replace(/\s/g, '');
  
  if (!/^\d{15}$/.test(sanitized)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(sanitized[i]);
    
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(sanitized[14]);
};

/**
 * Validate MAC address
 */
const isValidMACAddress = (mac) => {
  const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return regex.test(mac);
};

/**
 * Validate date range
 */
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      message: 'Invalid date format',
    };
  }

  if (start > end) {
    return {
      valid: false,
      message: 'Start date must be before end date',
    };
  }

  return { valid: true };
};

/**
 * Validate price range
 */
const isValidPriceRange = (minPrice, maxPrice) => {
  if (isNaN(minPrice) || isNaN(maxPrice)) {
    return {
      valid: false,
      message: 'Invalid price format',
    };
  }

  if (minPrice < 0 || maxPrice < 0) {
    return {
      valid: false,
      message: 'Prices must be non-negative',
    };
  }

  if (minPrice > maxPrice) {
    return {
      valid: false,
      message: 'Minimum price must be less than maximum price',
    };
  }

  return { valid: true };
};

/**
 * Validate sort code (UK bank)
 */
const isValidSortCode = (sortCode) => {
  const regex = /^\d{2}-\d{2}-\d{2}$/;
  return regex.test(sortCode);
};

/**
 * Validate account number (UK bank)
 */
const isValidAccountNumber = (accountNumber) => {
  const regex = /^\d{8}$/;
  return regex.test(accountNumber);
};

/**
 * Validate VAT number (UK)
 */
const isValidUKVAT = (vat) => {
  const regex = /^GB\d{9}$/;
  return regex.test(vat);
};

/**
 * Sanitize HTML to prevent XSS
 */
const sanitizeHTML = (html) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return html.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate JSON string
 */
const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate URL
 */
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate file size
 */
const isValidFileSize = (fileSize, maxSize) => {
  return fileSize <= maxSize;
};

/**
 * Validate file type
 */
const isValidFileType = (filename, allowedTypes) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(ext);
};

/**
 * Check if string contains only alphanumeric characters
 */
const isAlphanumeric = (str) => {
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(str);
};

/**
 * Check if string is a valid hex color
 */
const isValidHexColor = (color) => {
  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return regex.test(color);
};

module.exports = {
  isValidUKPostcode,
  isValidCreditCard,
  isStrongPassword,
  isValidIMEI,
  isValidMACAddress,
  isValidDateRange,
  isValidPriceRange,
  isValidSortCode,
  isValidAccountNumber,
  isValidUKVAT,
  sanitizeHTML,
  isValidJSON,
  isValidURL,
  isValidFileSize,
  isValidFileType,
  isAlphanumeric,
  isValidHexColor,
};
