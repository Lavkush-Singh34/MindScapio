import { Router } from "express";
import { z } from "zod";
import {
  createChapter,
  getChaptersBySubject,
  getAllChaptersBySubject,
  getChapterById,
  updateChapter,
  togglePublishChapter,
  deleteChapter,
} from "../controllers/chapter.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const createChapterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name too long")
    .trim(),
  slug: z.string().min(2).max(200).trim().toLowerCase()
    .regex(/^[a-z0-9-]+$/).optional(), order: z
      .number()
      .min(1, "Order must be at least 1"),
  description: z.string().max(500, "Description too long").trim().optional(),
  subjectId: z.string().min(1, "Subject ID is required"),
  classId: z.string().min(1, "Class ID is required"),
});

const updateChapterSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  slug: z
    .string()
    .min(2)
    .max(200)
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .optional(),
  order: z.number().min(1).optional(),
  description: z.string().max(500).trim().optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

const subjectIdQuerySchema = z.object({
  subjectId: z.string().min(1, "subjectId is required"),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/chapters?subjectId=xxx
// @desc    Get published chapters for a subject — public
router.get(
  "/",
  validateQuery(subjectIdQuerySchema),
  getChaptersBySubject
);

// @route   GET /api/chapters/admin?subjectId=xxx
// @desc    Get all chapters including drafts — admin, teacher
router.get(
  "/admin",
  protect,
  restrictTo("admin", "teacher"),
  validateQuery(subjectIdQuerySchema),
  getAllChaptersBySubject
);

// @route   GET /api/chapters/:id
// @desc    Get single chapter by ID — public
router.get(
  "/:id",
  validateParams(idParamSchema),
  getChapterById
);

// @route   POST /api/chapters
// @desc    Create a new chapter — admin, teacher
router.post(
  "/",
  protect,
  restrictTo("admin", "teacher"),
  validate(createChapterSchema),
  createChapter
);

// @route   PATCH /api/chapters/:id
// @desc    Update chapter — admin, teacher
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  validate(updateChapterSchema),
  updateChapter
);

// @route   PATCH /api/chapters/:id/publish
// @desc    Toggle publish status — admin, teacher
router.patch(
  "/:id/publish",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  togglePublishChapter
);

// @route   DELETE /api/chapters/:id
// @desc    Soft delete chapter — admin only
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  deleteChapter
);

export default router;
