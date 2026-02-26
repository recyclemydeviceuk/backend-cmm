const mongoose = require('mongoose');

const networkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Network name is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Network value is required'],
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

networkSchema.index({ name: 1 });
networkSchema.index({ sortOrder: 1 });
networkSchema.index({ isActive: 1 });

module.exports = mongoose.model('Network', networkSchema);
