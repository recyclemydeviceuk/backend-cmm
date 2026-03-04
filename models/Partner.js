const mongoose = require('mongoose');
const crypto = require('crypto');

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Partner name is required'],
      trim: true,
      unique: true,
    },
    keyHash: {
      type: String,
      required: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

partnerSchema.index({ keyHash: 1 });
partnerSchema.index({ isActive: 1 });

/**
 * Generate a cryptographically secure partner key.
 * Format: cmm_pk_<32 random hex chars>
 * Returns { plainKey, keyHash, keyPrefix }
 */
partnerSchema.statics.generateKey = function () {
  const random = crypto.randomBytes(32).toString('hex');
  const plainKey = `cmm_pk_${random}`;
  const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');
  const keyPrefix = `cmm_pk_${random.slice(0, 8)}...`;
  return { plainKey, keyHash, keyPrefix };
};

/**
 * Verify a raw key against a stored hash
 */
partnerSchema.statics.verifyKey = function (plainKey, keyHash) {
  const hash = crypto.createHash('sha256').update(plainKey).digest('hex');
  return hash === keyHash;
};

module.exports = mongoose.model('Partner', partnerSchema);
