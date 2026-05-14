import { Router } from "express";
import { z } from "zod";
import {
  createSubject,
  getSubjectsByClass,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const createSubjectSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .trim(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug too long")
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  icon: z.string().trim().optional(),
  classId: z.string().min(1, "Class ID is required"),
});

const updateSubjectSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .optional(),
  icon: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

const classIdQuerySchema = z.object({
  classId: z.string().min(1, "classId is required"),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/subjects?classId=xxx
// @desc    Get all subjects for a class — public
router.get(
  "/",
  validateQuery(classIdQuerySchema),
  getSubjectsByClass
);

// @route   GET /api/subjects/:id
// @desc    Get single subject by ID — public
router.get(
  "/:id",
  validateParams(idParamSchema),
  getSubjectById
);

// @route   POST /api/subjects
// @desc    Create a new subject — admin, teacher
router.post(
  "/",
  protect,
  restrictTo("admin", "teacher"),
  validate(createSubjectSchema),
  createSubject
);

// @route   PATCH /api/subjects/:id
// @desc    Update subject — admin, teacher
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  validate(updateSubjectSchema),
  updateSubject
);

// @route   DELETE /api/subjects/:id
// @desc    Soft delete subject — admin only
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  deleteSubject
);

export default router;
