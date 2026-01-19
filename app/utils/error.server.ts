export type ErrorDetails = Record<"title" | "description", string>;

export class AppError extends Error {
  status: number;
  details: ErrorDetails;

  constructor(message: string, status = 500, details: ErrorDetails) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details; // Optional extra details
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details: ErrorDetails) {
    super(message, 400, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details: ErrorDetails) {
    super(message, 401, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details: ErrorDetails) {
    super(message, 403, details);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found", details: ErrorDetails) {
    super(message, 404, details);
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", details: ErrorDetails) {
    super(message, 500, details);
    this.name = "InternalServerError";
  }
}
