module.exports = function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        issues: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    req.validated = result.data;
    next();
  };
};

