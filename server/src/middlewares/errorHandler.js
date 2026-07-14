/**
 * Centralized Error Handling Middleware
 * Follows consistent API error response format from rules.md Section 5.1 & 5.5
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Server Error:', err.message || err);

  // If Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // If Prisma Known Request Error (e.g., unique constraint violation)
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'A record with this field value already exists',
      error: 'DUPLICATE_RECORD',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record not found',
      error: 'NOT_FOUND',
    });
  }

  // If custom statusCode is attached to err
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  const errorCode = err.errorCode || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
  });
};

module.exports = errorHandler;
