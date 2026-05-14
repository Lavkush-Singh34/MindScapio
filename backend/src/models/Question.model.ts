import mongoose, { Document, Schema } from "mongoose";

// ─── Types ─────────────────────────────────────────────────────
export type QuestionType = "mcq" | "subjective" | "true_false";
export type DifficultyLevel = "easy" | "medium" | "hard";

// ─── Interface ─────────────────────────────────────────────────
export interface IQuestion extends Document {
  questionText: string;      // Markdown supported
  type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;             // Marks for this question

  // MCQ specific
  options?: string[];        // Array of 4 options (Markdown supported)
  correctOption?: number;    // Index of correct option (0–3)

  // Subjective specific
  answerText?: string;       // Model answer (Markdown supported)

  // True/False specific
  correctAnswer?: boolean;

  // Explanation shown after answering
  explanation?: string;      // Markdown supported

  quizId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId; // Denormalized
  classId: mongoose.Types.ObjectId;   // Denormalized

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const QuestionSchema = new Schema<IQuestion>(
  {
    // Question text — Markdown so admin can add bold, equations, code
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    // Question format
    type: {
      type: String,
      enum: ["mcq", "subjective", "true_false"],
      required: true,
      default: "mcq",
    },

    // AI auto-tags, admin can override
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // Marks this question carries in the quiz
    marks: {
      type: Number,
      required: true,
      default: 1,
    },

    // ── MCQ fields ──────────────────────────────────────────────

    // 4 options for MCQ questions
    options: {
      type: [String],
      default: undefined,
    },

    // Index of correct option — 0 = A, 1 = B, 2 = C, 3 = D
    correctOption: {
      type: Number,
      min: 0,
      max: 3,
      default: undefined,
    },

    // ── Subjective fields ───────────────────────────────────────

    // Model answer shown after submission
    answerText: {
      type: String,
      trim: true,
      default: undefined,
    },

    // ── True/False fields ───────────────────────────────────────
    correctAnswer: {
      type: Boolean,
      default: undefined,
    },

    // ── Explanation ─────────────────────────────────────────────

    // Shown after student answers — helps learning
    explanation: {
      type: String,
      trim: true,
      default: "",
    },

    // Parent references
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───────────────────────────────────────────────────

// Fetch all questions in a quiz
QuestionSchema.index({ quizId: 1 });

// Filter by difficulty within a quiz
QuestionSchema.index({ quizId: 1, difficulty: 1 });

// Admin overview by class
QuestionSchema.index({ classId: 1 });

export default mongoose.model<IQuestion>("Question", QuestionSchema);
