import { Router } from "express";
import { z } from "zod";
import {
  createQuestion,
  getQuestionsByQuiz,
  getAllQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware";

const router = Router();

// ─── Zod Schemas ───────────────────────────────────────────────

const createQuestionSchema = z
  .object({
    questionText: z
      .string()
      .min(5, "Question must be at least 5 characters")
      .trim(),
    type: z.enum(["mcq", "subjective", "true_false"]),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    marks: z.number().min(1, "Marks must be at least 1"),
    explanation: z.string().trim().optional(),

    // MCQ specific
    options: z.array(z.string().trim()).length(4).optional(),
    correctOption: z.number().min(0).max(3).optional(),

    // Subjective specific
    answerText: z.string().trim().optional(),

    // True/False specific
    correctAnswer: z.boolean().optional(),

    // Parent references
    quizId: z.string().min(1, "Quiz ID is required"),
    chapterId: z.string().min(1, "Chapter ID is required"),
    subjectId: z.string().min(1, "Subject ID is required"),
    classId: z.string().min(1, "Class ID is required"),
  })
  .superRefine((data, ctx) => {
    // MCQ validation
    if (data.type === "mcq") {
      if (!data.options || data.options.length !== 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MCQ questions must have exactly 4 options",
          path: ["options"],
        });
      }
      if (data.correctOption === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MCQ questions must have a correct option",
          path: ["correctOption"],
        });
      }
    }

    // Subjective validation
    if (data.type === "subjective" && !data.answerText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Subjective questions must have a model answer",
        path: ["answerText"],
      });
    }

    // True/False validation
    if (data.type === "true_false" && data.correctAnswer === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "True/False questions must have a correct answer",
        path: ["correctAnswer"],
      });
    }
  });

const updateQuestionSchema = z.object({
  questionText: z.string().min(5).trim().optional(),
  type: z.enum(["mcq", "subjective", "true_false"]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  marks: z.number().min(1).optional(),
  options: z.array(z.string().trim()).length(4).optional(),
  correctOption: z.number().min(0).max(3).optional(),
  answerText: z.string().trim().optional(),
  correctAnswer: z.boolean().optional(),
  explanation: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "Invalid ID"),
});

const quizIdQuerySchema = z.object({
  quizId: z.string().min(1, "quizId is required"),
});

// ─── Routes ────────────────────────────────────────────────────

// @route   GET /api/questions/admin?quizId=xxx
// @desc    Get all questions with answers — admin, teacher
router.get(
  "/admin",
  protect,
  restrictTo("admin", "teacher"),
  validateQuery(quizIdQuerySchema),
  getAllQuestionsByQuiz
);

// @route   GET /api/questions?quizId=xxx
// @desc    Get questions without answers — logged in users
router.get(
  "/",
  protect,
  validateQuery(quizIdQuerySchema),
  getQuestionsByQuiz
);

// @route   GET /api/questions/:id
// @desc    Get single question with answers — admin, teacher
router.get(
  "/:id",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  getQuestionById
);

// @route   POST /api/questions
// @desc    Create a new question — admin, teacher
router.post(
  "/",
  protect,
  restrictTo("admin", "teacher"),
  validate(createQuestionSchema),
  createQuestion
);

// @route   PATCH /api/questions/:id
// @desc    Update question — admin, teacher
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "teacher"),
  validateParams(idParamSchema),
  validate(updateQuestionSchema),
  updateQuestion
);

// @route   DELETE /api/questions/:id
// @desc    Soft delete question — admin only
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  validateParams(idParamSchema),
  deleteQuestion
);

export default router;
