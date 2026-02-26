// Order Status Constants
const ORDER_STATUSES = {
  RECEIVED: 'RECEIVED',
  PACK_SENT: 'PACK_SENT',
  DEVICE_RECEIVED: 'DEVICE_RECEIVED',
  INSPECTION_PASSED: 'INSPECTION_PASSED',
  INSPECTION_FAILED: 'INSPECTION_FAILED',
  PRICE_REVISED: 'PRICE_REVISED',
  PAYOUT_READY: 'PAYOUT_READY',
  PAID: 'PAID',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
};

const ORDER_STATUS_LABELS = {
  RECEIVED: 'Received',
  PACK_SENT: 'Pack Sent',
  DEVICE_RECEIVED: 'Device Received',
  INSPECTION_PASSED: 'Inspection Passed',
  INSPECTION_FAILED: 'Inspection Failed',
  PRICE_REVISED: 'Price Revised',
  PAYOUT_READY: 'Payout Ready',
  PAID: 'Paid',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};

// Order status workflow
const ORDER_STATUS_WORKFLOW = [
  'RECEIVED',
  'PACK_SENT',
  'DEVICE_RECEIVED',
  'INSPECTION_PASSED',
  'PAYOUT_READY',
  'PAID',
  'CLOSED',
];

// Payment Status
const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
};

// Payment Methods
const PAYMENT_METHODS = {
  BANK: 'bank',
};

// Postage Methods
const POSTAGE_METHODS = {
  LABEL: 'label',
  POSTBAG: 'postbag',
};

// Device Grades/Conditions
const DEVICE_GRADES = {
  NEW: 'NEW',
  GOOD: 'GOOD',
  BROKEN: 'BROKEN',
};

const DEVICE_GRADE_LABELS = {
  NEW: 'New / Mint',
  GOOD: 'Good',
  BROKEN: 'Broken / Faulty',
};

// Order Sources
const ORDER_SOURCES = {
  WEBSITE: 'WEBSITE',
  API: 'API',
};

// Admin Roles (for future expansion)
const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VIEWER: 'viewer',
};

// OTP Configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
  MAX_ATTEMPTS: 5,
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// File Upload Limits
const UPLOAD_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },
  CSV: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  },
};

// API Rate Limiting
const RATE_LIMIT = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};

// JWT Configuration
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET,
  EXPIRE: process.env.JWT_EXPIRE || '7d',
  COOKIE_EXPIRE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Validation Regex Patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_UK: /^(\+44|0)[1-9]\d{9}$/,
  POSTCODE_UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  SORT_CODE: /^\d{2}-\d{2}-\d{2}$/,
  ACCOUNT_NUMBER: /^\d{8}$/,
  ORDER_NUMBER: /^[A-Z0-9]{6}$/,
  IP_ADDRESS: /^(\d{1,3}\.){3}\d{1,3}$/,
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_OTP: 'Invalid or expired OTP',
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_NOT_AUTHORIZED: 'Email not authorized for admin access',
  IP_NOT_WHITELISTED: 'IP address not whitelisted',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  ORDER_NOT_FOUND: 'Order not found',
  DEVICE_NOT_FOUND: 'Device not found',
  DUPLICATE_ENTRY: 'Duplicate entry',
};

module.exports = {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_WORKFLOW,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  POSTAGE_METHODS,
  DEVICE_GRADES,
  DEVICE_GRADE_LABELS,
  ORDER_SOURCES,
  ADMIN_ROLES,
  OTP_CONFIG,
  PAGINATION,
  UPLOAD_LIMITS,
  RATE_LIMIT,
  JWT_CONFIG,
  HTTP_STATUS,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
};
