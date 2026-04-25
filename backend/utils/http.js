export function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function sendError(res, status, message, extra = {}) {
  return res.status(status).json({
    error: message,
    status,
    ...extra,
  });
}

export function sendCreated(req, res, body, resourcePath = null) {
  const location = resourcePath || req.originalUrl;

  return res
    .location(location)
    .status(201)
    .json(body);
}

export function createDeprecatedAliasRouter(canonicalPath, router) {
  return [
    (req, res, next) => {
      res.set("Deprecation", "true");
      res.set("Sunset", "Wed, 31 Dec 2026 23:59:59 GMT");
      res.set("Link", `<${canonicalPath}>; rel="canonical"`);
      next();
    },
    router,
  ];
}

export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
