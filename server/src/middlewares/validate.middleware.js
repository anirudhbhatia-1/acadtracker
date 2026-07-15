const responseHelper = require('../utils/responseHelper');

/**
 * Zod validation middleware factory.
 * Validates req.body, req.query, and req.params against the provided Zod schema.
 */
const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace req.body, req.query, and req.params with validated/parsed data
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    return next();
  } catch (error) {
    // If Zod validation fails, format structured field-level errors exactly per rules.md §5.3
    if (error.name === 'ZodError') {
      const fields = {};
      error.errors.forEach((err) => {
        // Strip out 'body', 'query', or 'params' prefix from path if present
        const path = err.path[0] === 'body' || err.path[0] === 'query' || err.path[0] === 'params'
          ? err.path.slice(1).join('.')
          : err.path.join('.');
        if (path) {
          fields[path] = err.message;
        }
      });
      return responseHelper.error(res, 'Validation error', 400, 'VALIDATION_ERROR', { fields });
    }
    return next(error);
  }
};

module.exports = validate;
