import { Router } from "express";
import { z } from "zod";
import {
  createAssignment,
  getAssignmentsByClass,
  getAllAssignmentsByClass,
  getAssignmentById,
  updateAssignment,
  updateAssignmentStatus,
  deleteAssignment,
} from "../controllers/assignment.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const createAssignmentSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .trim(),
  instructions: z.string().trim().optional(),
  totalMarks: z
    .number()
    .min(1, "Total marks must be at least 1")
    .max(100, "Total marks cannot exceed 100"),
  dueDate: z
    .string()
    .datetime({ message: "Invalid date format, use ISO 8601" }),
  chapterId: z.string().min(1, "Chapter ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  classId: z.string().min(1, "Class ID is required"),
});

const updateAssignmentSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().min(10).trim().optional(),
  instructions: z.string().trim().optional(),
  totalMarks: z.number().min(1).max(100).optional(),
  dueDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["published", "closed"], {
    errorMap: () => ({
      message: "Status must be either published or closed",
    }),
  }),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

const classQuerySchema = z.object({
  classId: z.string().min(1, "classId is required"),
  subjectId: z.string().optional(),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/assignments/admin?classId=xxx&subjectId=xxx
// @desc    Get all assignments including drafts — admin, teacher
router.get(
  "/admin",
  protect,
  restrictTo("admin", "teacher"),
  validateQuery(classQuerySchema),
  getAllAssignmentsByClass
);

// @route   GET /api/assignments?classId=xxx&subjectId=xxx
// @desc    Get published assignments for a class — public
router.get(
  "/",
  validateQuery(classQuerySchema),
  getAssignmentsByClass
);

// @route   GET /api/assignments/:id
// @desc    Get single assignment by ID — public
router.get(
  "/:id",
  validateParams(idParamSchema),
  getAssignmentById
);

// @route   POST /api/assignments
// @desc    Create a new assignment — admin, teacher
router.post(
  "/",
  protect,
  restrictTo("admin", "teacher"),
  validate(createAssignmentSchema),
  createAssignment
);

// @route   PATCH /api/assignments/:id
// @desc    Update assignment details — admin, teacher
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  validate(updateAssignmentSchema),
  updateAssignment
);

// @route   PATCH /api/assignments/:id/status
// @desc    Update assignment status — admin, teacher
router.patch(
  "/:id/status",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  validate(updateStatusSchema),
  updateAssignmentStatus
);

// @route   DELETE /api/assignments/:id
// @desc    Soft delete assignment — admin only
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  deleteAssignment
);

export default router;
