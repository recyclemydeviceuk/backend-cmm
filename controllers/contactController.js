const ContactSubmission = require('../models/ContactSubmission');
const emailService = require('../services/emailService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Create contact submission
    const submission = await ContactSubmission.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      sourceIp: req.ip || req.connection.remoteAddress,
    });

    // Send confirmation email to customer
    await emailService.sendContactConfirmation(submission);

    // Send notification to admin (optional)
    // await emailService.sendContactNotificationToAdmin(submission);

    logger.info(`Contact form submitted: ${email}`);

    return successResponse(
      res,
      {
        message: 'Thank you for contacting us. We will get back to you soon.',
        submissionId: submission._id,
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    logger.error(`Submit contact form error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get all contact submissions
 * @route   GET /api/contact
 * @access  Private
 */
exports.getAllSubmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const submissions = await ContactSubmission.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ContactSubmission.countDocuments(query);

    return successResponse(
      res,
      {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get all submissions error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Get single contact submission
 * @route   GET /api/contact/:id
 * @access  Private
 */
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await ContactSubmission.findById(req.params.id);

    if (!submission) {
      return errorResponse(
        res,
        'Submission not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    return successResponse(res, { submission }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error(`Get submission by ID error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Update contact submission status
 * @route   PATCH /api/contact/:id/status
 * @access  Private
 */
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const submission = await ContactSubmission.findById(req.params.id);

    if (!submission) {
      return errorResponse(
        res,
        'Submission not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    submission.status = status;
    await submission.save();

    logger.info(`Contact submission status updated: ${submission._id} - ${status}`);

    return successResponse(
      res,
      { submission, message: 'Status updated successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Update submission status error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * @desc    Delete contact submission
 * @route   DELETE /api/contact/:id
 * @access  Private
 */
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await ContactSubmission.findById(req.params.id);

    if (!submission) {
      return errorResponse(
        res,
        'Submission not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    await submission.deleteOne();

    logger.info(`Contact submission deleted: ${submission._id}`);

    return successResponse(
      res,
      { message: 'Submission deleted successfully' },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Delete submission error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
