import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "./error.middleware";

// ─── Format Zod Errors ─────────────────────────────────────────
const formatZodError = (error: ZodError): string => {
  return error.errors
    .map((e) => `${e.path?.join(".") || "field"} — ${e.message}`)
    .join(", ");
};
// ─── Validate Request Body ─────────────────────────────────────
export const validate = (schema: ZodSchema) => {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    try {
      _req.body = schema.parse(_req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // return next(new AppError(formatZodError(error), 400));
        return next(new AppError(error.errors ? formatZodError(error) : "Validation error", 400));
      }
      next(error);
    }
  };
};

// ─── Validate Query Params ─────────────────────────────────────
// Express 5 — req.query is read-only, so just validate don't reassign
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);  // ← just validate, don't reassign
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(formatZodError(error), 400));
      }
      next(error);
    }
  };
};

// ─── Validate Route Params ─────────────────────────────────────
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(formatZodError(error), 400));
      }
      next(error);
    }
  };
};
