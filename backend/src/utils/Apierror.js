class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // 👈 add this
    this.success = false;
    this.data = null;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ApiError;
