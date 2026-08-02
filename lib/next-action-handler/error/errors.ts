const ERROR_CODES = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "RATE_LIMITED",
  "INTERNAL_SERVER_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export class ActionError extends Error {
  public readonly code: ErrorCode;
  public readonly expose: boolean;
  public readonly suppressActionLog: boolean;
  public readonly cause?: unknown;

  constructor({
    message,
    code,
    expose = true,
    suppressActionLog = false,
    cause,
  }: {
    message: string;
    code: ErrorCode;
    expose?: boolean;
    suppressActionLog?: boolean;
    cause?: unknown;
  }) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.expose = expose;
    this.suppressActionLog = suppressActionLog;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ApiError extends ActionError {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string, cause?: unknown) {
    let code: ErrorCode = "INTERNAL_SERVER_ERROR";
    let expose = true;

    switch (statusCode) {
      case 400:
        code = "BAD_REQUEST";
        break;
      case 401:
        code = "UNAUTHORIZED";
        break;
      case 403:
        code = "FORBIDDEN";
        break;
      case 404:
        code = "NOT_FOUND";
        break;
      case 429:
        code = "RATE_LIMITED";
        break;
      default:
        code = "INTERNAL_SERVER_ERROR";
        expose = false;
        break;
    }

    super({ message, code, expose, cause });
    this.statusCode = statusCode;
  }
}
