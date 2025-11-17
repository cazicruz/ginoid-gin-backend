// catchAsync.js
// Utility to wrap async route handlers and forward errors to next()

module.exports = function catchAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 