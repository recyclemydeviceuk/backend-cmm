const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'closed'],
      default: 'new',
    },
    sourceIp: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

contactSubmissionSchema.index({ email: 1 });
contactSubmissionSchema.index({ status: 1, createdAt: -1 });
contactSubmissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
