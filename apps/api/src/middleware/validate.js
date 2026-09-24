const { ZodError } = require('zod');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || 'Validation error',
          details: errorDetails,
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid request data provided.',
      });
    }
  };
};

module.exports = validate;
