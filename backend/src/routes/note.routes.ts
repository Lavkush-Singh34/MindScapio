import { Router } from "express";
import { z } from "zod";
import {
  createNote,
  getNotesByChapter,
  getAllNotesByChapter,
  getNoteById,
  updateNote,
  togglePublishNote,
  deleteNote,
} from "../controllers/note.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const createNoteSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long")
    .trim(),
  content: z
    .string()
    .min(10, "Content too short")
    .trim(),
  chapterId: z.string().min(1, "Chapter ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  classId: z.string().min(1, "Class ID is required"),
});

const updateNoteSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  content: z.string().min(10).trim().optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

const chapterIdQuerySchema = z.object({
  chapterId: z.string().min(1, "chapterId is required"),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/notes?chapterId=xxx
// @desc    Get published notes for a chapter — public
router.get(
  "/",
  validateQuery(chapterIdQuerySchema),
  getNotesByChapter
);

// @route   GET /api/notes/admin?chapterId=xxx
// @desc    Get all notes including drafts — admin, teacher
router.get(
  "/admin",
  protect,
  restrictTo("admin", "teacher"),
  validateQuery(chapterIdQuerySchema),
  getAllNotesByChapter
);

// @route   GET /api/notes/:id
// @desc    Get single note by ID — public
router.get(
  "/:id",
  validateParams(idParamSchema),
  getNoteById
);

// @route   POST /api/notes
// @desc    Create a new note — admin, teacher
router.post(
  "/",
  protect,
  restrictTo("admin", "teacher"),
  validate(createNoteSchema),
  createNote
);

// @route   PATCH /api/notes/:id
// @desc    Update note — admin, teacher
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  validate(updateNoteSchema),
  updateNote
);

// @route   PATCH /api/notes/:id/publish
// @desc    Toggle publish status — admin, teacher
router.patch(
  "/:id/publish",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  togglePublishNote
);

// @route   DELETE /api/notes/:id
// @desc    Soft delete note — admin only
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  deleteNote
);

export default router;
