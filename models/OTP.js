const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'OTP code is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
