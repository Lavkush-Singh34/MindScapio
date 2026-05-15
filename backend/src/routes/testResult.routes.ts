import { Router } from "express";
import { z } from "zod";
import {
  startQuiz,
  submitQuiz,
  getStudentResults,
  getResultById,
  getLeaderboard,
  abandonQuiz,
} from "../controllers/testResult.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const startQuizSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  chapterId: z.string().min(1, "Chapter ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  classId: z.string().min(1, "Class ID is required"),
});

// ─── Single answer schema ──────────────────────────────────────
const answerSchema = z
  .object({
    questionId: z.string().min(1, "Question ID is required"),
    selectedOption: z.number().min(0).max(3).optional(),  // MCQ
    writtenAnswer: z.string().trim().optional(),           // Subjective
    booleanAnswer: z.boolean().optional(),                 // True/False
  })
  .refine(
    (data) =>
      data.selectedOption !== undefined ||
      data.writtenAnswer !== undefined ||
      data.booleanAnswer !== undefined,
    { message: "At least one answer field is required" }
  );

const submitQuizSchema = z.object({
  testResultId: z.string().min(1, "Test result ID is required"),
  answers: z
    .array(answerSchema)
    .min(1, "At least one answer is required"),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

const studentIdQuerySchema = z.object({
  studentId: z.string().optional(),
});

const quizIdQuerySchema = z.object({
  quizId: z.string().min(1, "quizId is required"),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/test-results/leaderboard?quizId=xxx
// @desc    Get top 10 scores for a quiz — public
router.get(
  "/leaderboard",
  validateQuery(quizIdQuerySchema),
  getLeaderboard
);

// @route   GET /api/test-results/student?studentId=xxx
// @desc    Get all results for a student — protected
router.get(
  "/student",
  protect,
  validateQuery(studentIdQuerySchema),
  getStudentResults
);

// @route   GET /api/test-results/:id
// @desc    Get single result with full answers — protected
router.get(
  "/:id",
  protect,
  validateParams(idParamSchema),
  getResultById
);

// @route   POST /api/test-results/start
// @desc    Start a quiz attempt — student, parent
router.post(
  "/start",
  protect,
  restrictTo("student", "parent"),
  validate(startQuizSchema),
  startQuiz
);

// @route   POST /api/test-results/submit
// @desc    Submit quiz answers — student, parent
router.post(
  "/submit",
  protect,
  restrictTo("student", "parent"),
  validate(submitQuizSchema),
  submitQuiz
);

// @route   PATCH /api/test-results/:id/abandon
// @desc    Abandon in_progress attempt — student, parent
router.patch(
  "/:id/abandon",
  protect,
  restrictTo("student", "parent"),
  validateParams(idParamSchema),
  abandonQuiz
);

export default router;
