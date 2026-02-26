/**
 * Helper utility functions
 * Common functions used across the application
 */

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate random numeric code
 */
const generateNumericCode = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Sleep/delay function
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Format currency (GBP)
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

/**
 * Format date
 */
const formatDate = (date, format = 'long') => {
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return new Intl.DateTimeFormat('en-GB', options[format] || options.long).format(new Date(date));
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Get file extension from filename
 */
const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Parse pagination parameters
 */
const parsePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build sort object from query
 */
const parseSort = (query) => {
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  return { [sortBy]: sortOrder };
};

/**
 * Remove undefined/null values from object
 */
const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v !== '')
  );
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if string is valid email
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Check if string is valid UK phone number
 */
const isValidUKPhone = (phone) => {
  const regex = /^(\+44|0)[0-9]{9,10}$/;
  return regex.test(phone);
};

/**
 * Mask email address
 */
const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
  return `${maskedName}@${domain}`;
};

/**
 * Mask phone number (show last 4 digits)
 */
const maskPhone = (phone) => {
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
};

/**
 * Calculate percentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

/**
 * Truncate string
 */
const truncate = (str, length = 50, ending = '...') => {
  if (str.length <= length) return str;
  return str.substring(0, length - ending.length) + ending;
};

/**
 * Capitalize first letter
 */
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert to title case
 */
const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Generate slug from string
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Check if date is today
 */
const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  return (
    compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Get days between two dates
 */
const daysBetween = (date1, date2) => {
  const one = new Date(date1);
  const two = new Date(date2);
  const diffTime = Math.abs(two - one);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Add days to date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Group array by key
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Remove duplicates from array
 */
const uniqueArray = (array) => {
  return [...new Set(array)];
};

/**
 * Chunk array into smaller arrays
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

module.exports = {
  generateRandomString,
  generateNumericCode,
  sleep,
  formatCurrency,
  formatDate,
  sanitizeFilename,
  getFileExtension,
  parsePagination,
  parseSort,
  removeEmpty,
  deepClone,
  isValidEmail,
  isValidUKPhone,
  maskEmail,
  maskPhone,
  calculatePercentage,
  truncate,
  capitalize,
  toTitleCase,
  slugify,
  isToday,
  daysBetween,
  addDays,
  groupBy,
  uniqueArray,
  chunkArray,
};
