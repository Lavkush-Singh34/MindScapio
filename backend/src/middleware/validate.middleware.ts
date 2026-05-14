import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "./error.middleware";

// ─── Format Zod Errors ─────────────────────────────────────────
const formatZodError = (error: ZodError): string => {
  return error.errors
    .map((e) => `${e.path.join(".")} — ${e.message}`)
    .join(", ");
};

// ─── Validate Request Body ─────────────────────────────────────
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(formatZodError(error), 400));
      }
      next(error);
    }
  };
};

// ─── Validate Query Params ─────────────────────────────────────
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
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
