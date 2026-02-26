const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    sourceIp: {
      type: String,
      required: [true, 'Source IP is required'],
      trim: true,
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint is required'],
      trim: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      required: [true, 'HTTP method is required'],
    },
    statusCode: {
      type: Number,
      required: [true, 'Status code is required'],
    },
    success: {
      type: Boolean,
      required: [true, 'Success flag is required'],
    },
    orderNumber: {
      type: String,
      trim: true,
    },
    payload: {
      type: String,
    },
    error: {
      type: String,
    },
    responseTime: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

apiLogSchema.index({ timestamp: -1 });
apiLogSchema.index({ sourceIp: 1, timestamp: -1 });
apiLogSchema.index({ success: 1 });
apiLogSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('ApiLog', apiLogSchema);
