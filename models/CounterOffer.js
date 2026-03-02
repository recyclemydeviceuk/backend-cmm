const mongoose = require('mongoose');

const counterOfferSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    revisedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    deviceImages: [{
      url: String,
      key: String,
      uploadedAt: Date,
    }],
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
      default: 'PENDING',
    },
    customerResponse: {
      type: String,
      enum: ['ACCEPTED', 'DECLINED'],
    },
    customerFeedback: {
      type: String,
    },
    respondedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    reviewToken: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: String, // Admin email
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (reviewToken already indexed via unique: true)
counterOfferSchema.index({ orderId: 1 });
counterOfferSchema.index({ orderNumber: 1 });
counterOfferSchema.index({ status: 1 });
counterOfferSchema.index({ expiresAt: 1 });

// Check if offer is expired
counterOfferSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model('CounterOffer', counterOfferSchema);
