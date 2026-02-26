const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
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

brandSchema.index({ name: 1 });
brandSchema.index({ sortOrder: 1 });
brandSchema.index({ isActive: 1 });

module.exports = mongoose.model('Brand', brandSchema);
