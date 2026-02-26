const multer = require('multer');
const path = require('path');
const { UPLOAD_LIMITS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Multer Storage Configuration
 * Stores files temporarily in uploads folder
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('image/') 
      ? 'uploads/images' 
      : 'uploads/csv';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

/**
 * File Filter for Images
 */
const imageFilter = (req, file, cb) => {
  if (UPLOAD_LIMITS.IMAGE.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

/**
 * File Filter for CSV
 */
const csvFilter = (req, file, cb) => {
  if (
    UPLOAD_LIMITS.CSV.ALLOWED_TYPES.includes(file.mimetype) ||
    file.originalname.endsWith('.csv')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV files are allowed.'), false);
  }
};

/**
 * Image Upload Middleware
 * Single image upload with size limit
 */
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD_LIMITS.IMAGE.MAX_SIZE,
  },
  fileFilter: imageFilter,
}).single('image');

/**
 * Multiple Images Upload Middleware
 * Up to 10 images
 */
const uploadMultipleImages = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD_LIMITS.IMAGE.MAX_SIZE,
    files: 10,
  },
  fileFilter: imageFilter,
}).array('images', 10);

/**
 * CSV Upload Middleware
 * Single CSV file upload
 */
const uploadCSV = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD_LIMITS.CSV.MAX_SIZE,
  },
  fileFilter: csvFilter,
}).single('file');

/**
 * Generic File Upload Middleware
 * Accepts any file type (use with caution)
 */
const uploadAny = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD_LIMITS.CSV.MAX_SIZE,
  },
}).any();

/**
 * Error Handler for Multer
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: ERROR_MESSAGES.FILE_TOO_LARGE,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files uploaded',
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || ERROR_MESSAGES.INVALID_FILE_TYPE,
    });
  }
  
  next();
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  uploadCSV,
  uploadAny,
  handleMulterError,
};
