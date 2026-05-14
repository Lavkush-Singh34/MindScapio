import { Router } from "express";
import { z } from "zod";
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} from "../controllers/class.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { validate, validateParams } from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const createClassSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .trim(),
  grade: z
    .number()
    .min(1, "Grade must be between 1 and 10")
    .max(10, "Grade must be between 1 and 10"),
  description: z.string().max(200, "Description too long").trim().optional(),
});

const updateClassSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  description: z.string().max(200).trim().optional(),
  isActive: z.boolean().optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/classes
// @desc    Get all active classes — public
router.get("/", getAllClasses);

// @route   GET /api/classes/:id
// @desc    Get single class by ID — public
router.get(
  "/:id",
  validateParams(idParamSchema),
  getClassById
);

// @route   POST /api/classes
// @desc    Create a new class — admin only
router.post(
  "/",
  protect,
  restrictTo("admin"),
  validate(createClassSchema),
  createClass
);

// @route   PATCH /api/classes/:id
// @desc    Update class — admin only
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  validate(updateClassSchema),
  updateClass
);

// @route   DELETE /api/classes/:id
// @desc    Soft delete class — admin only
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  deleteClass
);

export default router;
