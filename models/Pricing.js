const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: [true, 'Device ID is required'],
    },
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    network: {
      type: String,
      required: [true, 'Network is required'],
      trim: true,
    },
    storage: {
      type: String,
      required: [true, 'Storage is required'],
      trim: true,
    },
    gradeNew: {
      type: Number,
      required: [true, 'Price for NEW grade is required'],
      min: 0,
      default: 0,
    },
    gradeGood: {
      type: Number,
      required: [true, 'Price for GOOD grade is required'],
      min: 0,
      default: 0,
    },
    gradeBroken: {
      type: Number,
      required: [true, 'Price for BROKEN grade is required'],
      min: 0,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

pricingSchema.index({ deviceId: 1, network: 1, storage: 1 }, { unique: true });
pricingSchema.index({ deviceName: 1 });
pricingSchema.index({ network: 1 });
pricingSchema.index({ storage: 1 });

module.exports = mongoose.model('Pricing', pricingSchema);
