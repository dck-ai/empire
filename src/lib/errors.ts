

export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in required.") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class ConfigError extends AppError {
  constructor(message: string) {
    super(502, message);
    this.name = "ConfigError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
