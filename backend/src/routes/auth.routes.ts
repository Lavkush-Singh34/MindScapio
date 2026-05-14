import { Router } from "express";
import { z } from "zod";
import {
  googleAuth,
  googleAuthCallback,
  getMe,
  updateProfile,
  addChild,
  logout,
} from "../controllers/auth.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .trim(),
});

const addChildSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .trim(),
  class: z
    .number()
    .min(1, "Class must be between 1 and 10")
    .max(10, "Class must be between 1 and 10"),
});

// ─── Google OAuth Routes ───────────────────────────────────────

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get("/google", googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google redirects here after user consents
// @access  Public
router.get("/google/callback", googleAuthCallback);

// ─── User Routes ───────────────────────────────────────────────

// @route   GET /api/auth/me
// @desc    Get logged in user profile
// @access  Protected
router.get("/me", protect, getMe);

// @route   PATCH /api/auth/update-profile
// @desc    Update display name
// @access  Protected
router.patch(
  "/update-profile",
  protect,
  validate(updateProfileSchema),
  updateProfile
);

// @route   POST /api/auth/add-child
// @desc    Parent adds a child with class assigned
// @access  Protected — parent only
router.post(
  "/add-child",
  protect,
  restrictTo("parent"),
  validate(addChildSchema),
  addChild
);

// @route   GET /api/auth/logout
// @desc    Logout user
// @access  Protected
router.get("/logout", protect, logout);

export default router;
