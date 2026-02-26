const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specifications: {
      screenSize: String,
      processor: String,
      camera: String,
      battery: String,
      releaseYear: Number,
    },
  },
  {
    timestamps: true,
  }
);

deviceSchema.index({ brand: 1, name: 1 });
deviceSchema.index({ category: 1 });
deviceSchema.index({ isActive: 1 });
deviceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Device', deviceSchema);
