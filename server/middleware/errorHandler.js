export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(status).json({
    success: false,
    message: isProduction && status === 500 ? 'Internal server error' : message,
    ...(isProduction ? {} : { stack: err.stack }),
    ...(err.errors && { errors: err.errors })
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const ApiError = class extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }

  static badRequest(message, errors = null) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
};

export default { errorHandler, notFoundHandler, asyncHandler, ApiError };