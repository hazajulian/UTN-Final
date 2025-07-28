// Wrap async route handlers y propaga errores a errorHandler
export const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);