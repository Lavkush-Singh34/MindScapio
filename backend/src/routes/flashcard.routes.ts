import { Router } from "express";
import { z } from "zod";
import {
  createFlashcard,
  createBulkFlashcards,
  getFlashcardsByChapter,
  getAllFlashcardsByChapter,
  getFlashcardById,
  updateFlashcard,
  togglePublishFlashcard,
  deleteFlashcard,
} from "../controllers/flashcard.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const createFlashcardSchema = z.object({
  front: z
    .string()
    .min(2, "Front must be at least 2 characters")
    .trim(),
  back: z
    .string()
    .min(2, "Back must be at least 2 characters")
    .trim(),
  hint: z.string().trim().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  order: z.number().min(1).optional(),
  chapterId: z.string().min(1, "Chapter ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  classId: z.string().min(1, "Class ID is required"),
});

// ─── Bulk schema — array of cards + parent IDs ─────────────────
const bulkFlashcardSchema = z.object({
  flashcards: z
    .array(
      z.object({
        front: z.string().min(2).trim(),
        back: z.string().min(2).trim(),
        hint: z.string().trim().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      })
    )
    .min(1, "At least one flashcard is required")
    .max(50, "Cannot create more than 50 flashcards at once"),
  chapterId: z.string().min(1, "Chapter ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  classId: z.string().min(1, "Class ID is required"),
});

const updateFlashcardSchema = z.object({
  front: z.string().min(2).trim().optional(),
  back: z.string().min(2).trim().optional(),
  hint: z.string().trim().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  order: z.number().min(1).optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

const chapterIdQuerySchema = z.object({
  chapterId: z.string().min(1, "chapterId is required"),
});

const flashcardsQuerySchema = z.object({
  chapterId: z.string().min(1, "chapterId is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/flashcards/admin?chapterId=xxx
// @desc    Get all flashcards including drafts — admin, teacher
router.get(
  "/admin",
  protect,
  restrictTo("admin", "teacher"),
  validateQuery(chapterIdQuerySchema),
  getAllFlashcardsByChapter
);

// @route   GET /api/flashcards?chapterId=xxx&difficulty=xxx
// @desc    Get published flashcards for a chapter — public
router.get(
  "/",
  validateQuery(flashcardsQuerySchema),
  getFlashcardsByChapter
);

// @route   GET /api/flashcards/:id
// @desc    Get single flashcard by ID — public
router.get(
  "/:id",
  validateParams(idParamSchema),
  getFlashcardById
);

// @route   POST /api/flashcards
// @desc    Create a single flashcard — admin, teacher
router.post(
  "/",
  protect,
  restrictTo("admin", "teacher"),
  validate(createFlashcardSchema),
  createFlashcard
);

// @route   POST /api/flashcards/bulk
// @desc    Create multiple flashcards at once — admin, teacher
router.post(
  "/bulk",
  protect,
  restrictTo("admin", "teacher"),
  validate(bulkFlashcardSchema),
  createBulkFlashcards
);

// @route   PATCH /api/flashcards/:id
// @desc    Update flashcard — admin, teacher
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  validate(updateFlashcardSchema),
  updateFlashcard
);

// @route   PATCH /api/flashcards/:id/publish
// @desc    Toggle publish status — admin, teacher
router.patch(
  "/:id/publish",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  togglePublishFlashcard
);

// @route   DELETE /api/flashcards/:id
// @desc    Soft delete flashcard — admin only
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  deleteFlashcard
);

export default router;
