/**
 * Standard API response utilities
 * Provides consistent response formatting across all endpoints
 */

/**
 * Send success response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 */
const errorResponse = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    error: message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

/**
 * Send created response (201)
 */
const createdResponse = (res, data = null, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Send not found response (404)
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

/**
 * Send bad request response (400)
 */
const badRequestResponse = (res, message = 'Bad request', errors = null) => {
  return errorResponse(res, message, 400, errors);
};

/**
 * Send unauthorized response (401)
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

/**
 * Send forbidden response (403)
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Send conflict response (409)
 */
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409);
};

/**
 * Send unprocessable entity response (422)
 */
const unprocessableEntityResponse = (res, message = 'Validation failed', errors = null) => {
  return errorResponse(res, message, 422, errors);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  unprocessableEntityResponse,
};
