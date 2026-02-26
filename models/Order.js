const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      uppercase: true,
    },
    source: {
      type: String,
      enum: ['WEBSITE', 'API'],
      required: [true, 'Order source is required'],
    },
    status: {
      type: String,
      default: 'PENDING',
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    customerAddress: {
      type: String,
      required: [true, 'Customer address is required'],
    },
    postcode: {
      type: String,
      trim: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
    },
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
    },
    network: {
      type: String,
      required: [true, 'Network is required'],
    },
    deviceGrade: {
      type: String,
      enum: ['NEW', 'GOOD', 'BROKEN'],
      required: [true, 'Device grade is required'],
    },
    storage: {
      type: String,
      required: [true, 'Storage is required'],
    },
    offeredPrice: {
      type: Number,
      required: [true, 'Offered price is required'],
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    postageMethod: {
      type: String,
      enum: ['label', 'postbag'],
      required: [true, 'Postage method is required'],
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank'],
      default: 'bank',
    },
    paymentStatus: {
      type: String,
      default: 'PENDING',
    },
    payoutDetails: {
      accountName: {
        type: String,
        trim: true,
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      sortCode: {
        type: String,
        trim: true,
      },
    },
    transactionId: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ source: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
