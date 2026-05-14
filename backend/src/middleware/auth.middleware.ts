import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { AppError } from "./error.middleware";
import User, { UserRole } from "../models/User.model";

// ─── Extend Express Request ────────────────────────────────────
// Adds `user` property to req object so controllers can access it
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        email: string;
      };
    }
  }
}

// ─── JWT Payload Interface ─────────────────────────────────────
interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

// ─── Protect Route — Verify JWT ────────────────────────────────
// Use on any route that requires login
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Extract token from Authorization header
    // Expected format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("You are not logged in, please login to continue", 401);
    }

    // Verify token signature and expiry
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    // Check if user still exists in DB
    // Handles case where account was deleted after token was issued
    const user = await User.findById(decoded.id).select("_id role email isActive");

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been deactivated, please contact admin", 403);
    }

    // Attach user info to request — available in all downstream controllers
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// ─── Restrict To Specific Roles ────────────────────────────────
// Use after protect middleware
// e.g. restrictTo("admin") — only admin can access
// e.g. restrictTo("admin", "parent") — admin and parent can access
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
