/**
 * Standard API response helpers following rules.md Section 5.1
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'Error', statusCode = 400, errorCode = 'ERROR', details = null) => {
  const response = {
    success: false,
    message,
    error: errorCode,
  };
  if (details !== null && details !== undefined) {
    if (details.fields) {
      response.fields = details.fields;
    } else {
      response.details = details;
    }
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
  success: sendSuccess,
  error: sendError,
};
