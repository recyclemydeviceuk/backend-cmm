const { S3Client } = require('@aws-sdk/client-s3');
const { SESClient } = require('@aws-sdk/client-ses');

// S3 Client Configuration (uses dedicated S3 credentials)
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'ap-south-1',
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// SES Client Configuration (uses general AWS credentials)
const sesClient = new SESClient({
  region: process.env.SES_REGION || process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// S3 Bucket Configuration
const s3Config = {
  bucketName: process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'zennara-storage',
  region: process.env.AWS_S3_REGION || process.env.AWS_REGION || 'ap-south-1',
  folders: {
    deviceImages: 'devices/',
    csvImports: 'csv/',
    exports: 'exports/',
  },
};

// SES Configuration
const sesConfig = {
  fromEmail: process.env.SES_FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL || 'noreply@cashmymobile.co.uk',
  replyToEmail: process.env.REPLY_TO_EMAIL || 'Support@cashmymobile.co.uk',
  region: process.env.SES_REGION || process.env.AWS_REGION || 'ap-south-1',
};

const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'zennara-storage';

module.exports = {
  s3Client,
  sesClient,
  s3Config,
  sesConfig,
  S3_BUCKET_NAME,
};
