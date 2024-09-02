import { StatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: StatusCode,
    public readonly stack = ""
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string,
    public readonly statusCode: StatusCode = 404
  ) {
    super(message, statusCode);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string,
    public readonly statusCode: StatusCode = 403
  ) {
    super(message, statusCode);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string,
    public readonly statusCode: StatusCode = 401
  ) {
    super(message, statusCode);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string,
    public readonly statusCode: StatusCode = 409
  ) {
    super(message, statusCode);
    this.name = "ConflictError";
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string,
    public readonly statusCode: StatusCode = 400
  ) {
    super(message, statusCode);
    this.name = "BadRequestError";
  }
}
