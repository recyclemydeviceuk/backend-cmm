const s3Service = require('../services/s3Service');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

/**
 * @desc    Upload device image to S3
 * @route   POST /api/upload/image
 * @access  Private
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(
        res,
        'No file uploaded',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Upload to S3
    const imageUrl = await s3Service.uploadFile(
      req.file.path,
      `devices/${Date.now()}_${req.file.originalname}`
    );

    // Delete local file
    await fs.unlink(req.file.path);

    logger.info(`Image uploaded: ${imageUrl}`);

    return successResponse(
      res,
      {
        message: 'Image uploaded successfully',
        imageUrl,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    // Clean up local file if it exists
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error(`Failed to delete temp file: ${unlinkError.message}`);
      }
    }

    logger.error(`Upload image error: ${error.message}`);
    logger.error(`S3 error code: ${error.Code || error.code || 'unknown'}`);
    logger.error(`S3 error name: ${error.name || 'unknown'}`);
    logger.error(`S3 error endpoint: ${error.$metadata?.httpStatusCode || 'unknown'}`);
    logger.error(`Full error: ${JSON.stringify({ code: error.Code || error.code, name: error.name, message: error.message, region: error.region, bucket: error.bucket })}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Upload CSV file
 * @route   POST /api/upload/csv
 * @access  Private
 */
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(
        res,
        'No file uploaded',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    logger.info(`CSV uploaded: ${fileName}`);

    return successResponse(
      res,
      {
        message: 'CSV uploaded successfully',
        filePath,
        fileName,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Upload CSV error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Delete image from S3
 * @route   DELETE /api/upload/image
 * @access  Private
 */
exports.deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return errorResponse(
        res,
        'Image URL is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await s3Service.deleteFile(imageUrl);

    logger.info(`Image deleted: ${imageUrl}`);

    return successResponse(
      res,
      { message: 'Image deleted successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Delete image error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Upload multiple images
 * @route   POST /api/upload/images
 * @access  Private
 */
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(
        res,
        'No files uploaded',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const uploadPromises = req.files.map(async (file) => {
      const imageUrl = await s3Service.uploadFile(
        file.path,
        `devices/${Date.now()}_${file.originalname}`
      );
      
      // Delete local file
      await fs.unlink(file.path);
      
      return imageUrl;
    });

    const imageUrls = await Promise.all(uploadPromises);

    logger.info(`${imageUrls.length} images uploaded`);

    return successResponse(
      res,
      {
        message: `${imageUrls.length} images uploaded successfully`,
        imageUrls,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    // Clean up local files if they exist
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          logger.error(`Failed to delete temp file: ${unlinkError.message}`);
        }
      }
    }

    logger.error(`Upload multiple images error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get presigned URL for direct upload to S3
 * @route   POST /api/upload/presigned-url
 * @access  Private
 */
exports.getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return errorResponse(
        res,
        'fileName and fileType are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const key = `devices/${Date.now()}_${fileName}`;
    const presignedUrl = await s3Service.getPresignedUrl(key, fileType);

    logger.info(`Presigned URL generated for: ${fileName}`);

    return successResponse(
      res,
      {
        presignedUrl,
        key,
        fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get presigned URL error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
