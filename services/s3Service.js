const { s3Client, S3_BUCKET_NAME } = require('../config/aws');
const { 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Upload file to S3
 */
const uploadFile = async (filePath, key) => {
  try {
    // Read file from local filesystem
    const fileContent = await fs.readFile(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.csv': 'text/csv',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Construct public URL
    const region = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'ap-south-1';
    const url = `https://${S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    logger.info(`File uploaded to S3: ${key}`);
    return url;
  } catch (error) {
    logger.error(`Error uploading file to S3:`, error.message);
    throw error;
  }
};

/**
 * Upload buffer to S3
 */
const uploadBuffer = async (buffer, key, contentType = 'application/octet-stream') => {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const region = process.env.AWS_REGION || 'ap-south-1';
    const url = `https://${S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    logger.info(`Buffer uploaded to S3: ${key}`);
    return url;
  } catch (error) {
    logger.error(`Error uploading buffer to S3:`, error.message);
    throw error;
  }
};

/**
 * Delete file from S3
 */
const deleteFile = async (urlOrKey) => {
  try {
    // Extract key from URL if full URL is provided
    let key = urlOrKey;
    if (urlOrKey.includes('amazonaws.com')) {
      const url = new URL(urlOrKey);
      key = url.pathname.substring(1); // Remove leading slash
    }

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    logger.info(`File deleted from S3: ${key}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting file from S3:`, error.message);
    throw error;
  }
};

/**
 * Get presigned URL for temporary access
 */
const getPresignedUrl = async (key, contentType = 'application/octet-stream', expiresIn = 3600) => {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    logger.info(`Presigned URL generated for: ${key}`);
    return url;
  } catch (error) {
    logger.error(`Error generating presigned URL:`, error.message);
    throw error;
  }
};

/**
 * Check if file exists in S3
 */
const fileExists = async (key) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    logger.error(`Error checking file existence:`, error.message);
    throw error;
  }
};

/**
 * Download file from S3 to buffer
 */
const downloadFile = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const chunks = [];

    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    logger.info(`File downloaded from S3: ${key}`);
    return buffer;
  } catch (error) {
    logger.error(`Error downloading file from S3:`, error.message);
    throw error;
  }
};

module.exports = {
  uploadFile,
  uploadBuffer,
  deleteFile,
  getPresignedUrl,
  fileExists,
  downloadFile,
};
