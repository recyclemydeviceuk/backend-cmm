/**
 * Application constants
 * Centralized location for all constant values
 */

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
};

// Error Messages
const ERROR_MESSAGES = {
  // Generic
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  
  // Auth
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  
  // OTP
  OTP_EXPIRED: 'OTP has expired',
  INVALID_OTP: 'Invalid OTP',
  OTP_SEND_FAILED: 'Failed to send OTP',
  
  // User/Admin
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
  EMAIL_EXISTS: 'Email already exists',
  
  // Orders
  ORDER_NOT_FOUND: 'Order not found',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  
  // Devices
  DEVICE_NOT_FOUND: 'Device not found',
  
  // Pricing
  PRICING_NOT_FOUND: 'Pricing not found',
  NO_QUOTE_AVAILABLE: 'No quote available for this configuration',
  
  // File Upload
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_UPLOAD_FAILED: 'File upload failed',
  
  // IP Whitelist
  IP_NOT_WHITELISTED: 'IP address is not whitelisted',
  IP_ALREADY_EXISTS: 'IP address already exists',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
};

// Success Messages
const SUCCESS_MESSAGES = {
  // Generic
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  
  // Auth
  OTP_SENT: 'OTP sent successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  
  // Orders
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  STATUS_UPDATED: 'Order status updated successfully',
  
  // File Upload
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',
  
  // Import/Export
  IMPORT_SUCCESS: 'Data imported successfully',
  EXPORT_SUCCESS: 'Data exported successfully',
};

// Order Statuses
const ORDER_STATUS = {
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

// Order Sources
const ORDER_SOURCE = {
  WEBSITE: 'WEBSITE',
  DECISIONTECH: 'DECISIONTECH',
  CSV_IMPORT: 'CSV_IMPORT',
  MANUAL: 'MANUAL',
};

// Device Grades
const DEVICE_GRADE = {
  NEW: 'NEW',
  GOOD: 'GOOD',
  BROKEN: 'BROKEN',
};

// Postage Methods
const POSTAGE_METHOD = {
  LABEL: 'label',
  POSTBAG: 'postbag',
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Contact Submission Status
const CONTACT_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// Admin Roles
const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VIEWER: 'viewer',
};

// OTP Configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
};

// Rate Limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// File Upload Limits
const UPLOAD_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
  CSV: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  },
};

// Regex Patterns
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UK_PHONE: /^(\+44|0)[0-9]{9,10}$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ORDER_STATUS,
  ORDER_SOURCE,
  DEVICE_GRADE,
  POSTAGE_METHOD,
  PAYMENT_STATUS,
  CONTACT_STATUS,
  ADMIN_ROLES,
  OTP_CONFIG,
  RATE_LIMIT,
  PAGINATION,
  UPLOAD_LIMITS,
  REGEX,
};
