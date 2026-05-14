import { Request, Response, NextFunction } from "express";

// ─── Custom Error Class ────────────────────────────────────────
// Extend built-in Error to include HTTP status code
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;    // Operational errors are expected (404, 401 etc.)

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Standard API Response Helper ─────────────────────────────
export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: unknown
) => {
  res.status(statusCode).json({
    success,
    message,
    data: data ?? null,
  });
};

// ─── Global Error Handler ──────────────────────────────────────
// Must have 4 params for Express to treat it as error middleware
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 if no status code
  const statusCode = (err as AppError).statusCode ?? 500;
  const isOperational = (err as AppError).isOperational ?? false;

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("─── Error ───────────────────────────────");
    console.error("Message :", err.message);
    console.error("Status  :", statusCode);
    console.error("Stack   :", err.stack);
    console.error("─────────────────────────────────────────");
  }

  // Mongoose duplicate key error (e.g. duplicate email)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(400).json({
      success: false,
      message: `${field} already exists`,
      data: null,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values((err as any).errors).map(
      (e: any) => e.message
    );
    res.status(400).json({
      success: false,
      message: messages.join(", "),
      data: null,
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token, please login again",
      data: null,
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired, please login again",
      data: null,
    });
    return;
  }

  // Operational errors — send exact message
  if (isOperational) {
    res.status(statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // Unknown errors — don't leak details in production
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong, please try again later",
    data: null,
  });
};
