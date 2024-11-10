class ApiError extends Error {
  constructor(
    statusCode = 500, // Default status code is set here
    message = 'Something went wrong',
    errors = [],
    stack
  ) {
    super(message); // Pass the message to the parent Error class
    this.statusCode = statusCode; // No need for || 500 since it's defaulted
    this.errors = errors;
    this.success = false;

    // Stack is set automatically unless explicitly provided
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
