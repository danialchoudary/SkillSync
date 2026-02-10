// Production-safe error handler
export const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging (in production, this should go to a secure logging service)
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = isDevelopment ? err.details : 'Please check your input and try again.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    details = 'The provided data is not in the correct format.';
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    statusCode = 500;
    message = 'Database error';
    details = 'A database error occurred. Please try again later.';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate entry';
    details = 'This data already exists.';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    details = 'Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    details = 'Please log in again.';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    details = err.message;
  } else if (err.status) {
    statusCode = err.status;
    message = err.message || 'Request failed';
  }

  // Build error response
  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  };

  // Add details only in development or for specific safe errors
  if (details && (isDevelopment || statusCode < 500)) {
    errorResponse.details = details;
  }

  // Add stack trace only in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Resource not found',
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};