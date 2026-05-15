import { Router } from "express";
import { z } from "zod";
import {
  createQuiz,
  getQuizzesByChapter,
  getAllQuizzesByChapter,
  getScheduledQuizzes,
  getQuizById,
  updateQuiz,
  togglePublishQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const createQuizSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long")
    .trim(),
  description: z.string().max(500).trim().optional(),
  type: z.enum(["mcq", "subjective", "mixed"]),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(180, "Duration cannot exceed 180 minutes"),
  totalMarks: z.number().min(1, "Total marks must be at least 1"),
  chapterId: z.string().min(1, "Chapter ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  scheduledAt: z.string().datetime().optional(), // ISO 8601 date string
});

const updateQuizSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().max(500).trim().optional(),
  type: z.enum(["mcq", "subjective", "mixed"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  duration: z.number().min(1).max(180).optional(),
  totalMarks: z.number().min(1).optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
  scheduledAt: z.string().datetime().optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

const chapterIdQuerySchema = z.object({
  chapterId: z.string().min(1, "chapterId is required"),
});

const classIdQuerySchema = z.object({
  classId: z.string().min(1, "classId is required"),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/quizzes/scheduled?classId=xxx
// @desc    Get today's scheduled quizzes for a class — public
router.get(
  "/scheduled",
  validateQuery(classIdQuerySchema),
  getScheduledQuizzes
);

// @route   GET /api/quizzes/admin?chapterId=xxx
// @desc    Get all quizzes including drafts — admin, teacher
router.get(
  "/admin",
  protect,
  restrictTo("admin", "teacher"),
  validateQuery(chapterIdQuerySchema),
  getAllQuizzesByChapter
);

// @route   GET /api/quizzes?chapterId=xxx
// @desc    Get published quizzes for a chapter — public
router.get(
  "/",
  validateQuery(chapterIdQuerySchema),
  getQuizzesByChapter
);

// @route   GET /api/quizzes/:id
// @desc    Get single quiz by ID — public
router.get(
  "/:id",
  validateParams(idParamSchema),
  getQuizById
);

// @route   POST /api/quizzes
// @desc    Create a new quiz — admin, teacher
router.post(
  "/",
  protect,
  restrictTo("admin", "teacher"),
  validate(createQuizSchema),
  createQuiz
);

// @route   PATCH /api/quizzes/:id
// @desc    Update quiz — admin, teacher
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  validate(updateQuizSchema),
  updateQuiz
);

// @route   PATCH /api/quizzes/:id/publish
// @desc    Toggle publish status — admin, teacher
router.patch(
  "/:id/publish",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  togglePublishQuiz
);

// @route   DELETE /api/quizzes/:id
// @desc    Soft delete quiz — admin only
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  deleteQuiz
);

export default router;
