const mongoose = require('mongoose');

const storageOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Storage name is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Storage value is required'],
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
  {
    timestamps: true,
  }
);

storageOptionSchema.index({ name: 1 });
storageOptionSchema.index({ sortOrder: 1 });
storageOptionSchema.index({ isActive: 1 });

module.exports = mongoose.model('StorageOption', storageOptionSchema);
