const mongoose = require('mongoose');

const deviceConditionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Condition name is required'],
      unique: true,
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Condition value is required'],
      trim: true,
      uppercase: true,
    },
    description: {
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

deviceConditionSchema.index({ name: 1 });
deviceConditionSchema.index({ value: 1 });
deviceConditionSchema.index({ sortOrder: 1 });
deviceConditionSchema.index({ isActive: 1 });

module.exports = mongoose.model('DeviceCondition', deviceConditionSchema);
