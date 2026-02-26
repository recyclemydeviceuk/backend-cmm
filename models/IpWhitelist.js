const mongoose = require('mongoose');

const ipWhitelistSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: [true, 'IP address is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^(\d{1,3}\.){3}\d{1,3}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid IP address`,
      },
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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

ipWhitelistSchema.index({ ip: 1 });
ipWhitelistSchema.index({ isActive: 1 });

module.exports = mongoose.model('IpWhitelist', ipWhitelistSchema);
