const mongoose = require('mongoose');

const paymentStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Status name is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Status value is required'],
      trim: true,
      uppercase: true,
    },
    color: {
      type: String,
      default: 'bg-gray-100 text-gray-700',
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

paymentStatusSchema.index({ sortOrder: 1 });
paymentStatusSchema.index({ isActive: 1 });

module.exports = mongoose.model('PaymentStatus', paymentStatusSchema);
