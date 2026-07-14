/**
 * Standard API response helpers following rules.md Section 5.1
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 400, message = 'Error', errorCode = 'ERROR') => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
