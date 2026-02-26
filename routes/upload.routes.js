const express = require('express');
const router = express.Router();
const {
  uploadImage,
  uploadCSV,
  deleteImage,
  uploadMultipleImages,
  getPresignedUrl,
} = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const {
  uploadImage: uploadImageMiddleware,
  uploadMultipleImages: uploadMultipleImagesMiddleware,
  uploadCSV: uploadCSVMiddleware,
  handleMulterError,
} = require('../middleware/upload');
const { validate } = require('../middleware/validator');
const { body } = require('express-validator');

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to S3
 * @access  Private
 */
router.post('/image', auth, uploadImageMiddleware, handleMulterError, uploadImage);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images to S3
 * @access  Private
 */
router.post(
  '/images',
  auth,
  uploadMultipleImagesMiddleware,
  handleMulterError,
  uploadMultipleImages
);

/**
 * @route   POST /api/upload/csv
 * @desc    Upload CSV file
 * @access  Private
 */
router.post('/csv', auth, uploadCSVMiddleware, handleMulterError, uploadCSV);

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete image from S3
 * @access  Private
 */
router.delete(
  '/image',
  auth,
  [body('imageUrl').notEmpty().withMessage('Image URL is required')],
  validate,
  deleteImage
);

/**
 * @route   POST /api/upload/presigned-url
 * @desc    Get presigned URL for direct upload to S3
 * @access  Private
 */
router.post(
  '/presigned-url',
  auth,
  [
    body('fileName').notEmpty().trim().withMessage('File name is required'),
    body('fileType').notEmpty().trim().withMessage('File type is required'),
  ],
  validate,
  getPresignedUrl
);

module.exports = router;
