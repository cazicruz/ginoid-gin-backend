class ApiError extends Error {
    constructor(message, statusCode = 500, cause = null, meta = {}) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.cause = cause;
      this.meta = meta;
  
      // Preserve full stack trace if cause exists
      if (cause instanceof Error && cause.stack) {
        this.stack += '\nCaused by: ' + cause.stack;
      }
  
      Error.captureStackTrace(this, this.constructor);
    }
  
    toJSON() {
      return {
        error: true,
        message: this.message,
        statusCode: this.statusCode,
        meta: this.meta,
        cause: this.cause?.message || null
      };
    }
  }
  
  function apiError(message, statusCode = 500, cause = null, meta = {}) {
    return new ApiError(message, statusCode, cause, meta);
  }
  
  module.exports = apiError;
  module.exports.ApiError = ApiError;
  