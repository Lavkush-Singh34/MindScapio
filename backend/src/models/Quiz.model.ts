import mongoose, { Document, Schema } from "mongoose";

// ─── Types ─────────────────────────────────────────────────────
export type QuizType = "mcq" | "subjective" | "mixed";
export type DifficultyLevel = "easy" | "medium" | "hard";

// ─── Interface ─────────────────────────────────────────────────
export interface IQuiz extends Document {
  title: string;             // e.g. "Chapter 1 Quick Test"
  description?: string;      // Brief info about the quiz
  type: QuizType;            // MCQ, subjective or mixed
  difficulty: DifficultyLevel;
  duration: number;          // Time limit in minutes
  totalMarks: number;        // Total marks for this quiz
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId; // Denormalized
  classId: mongoose.Types.ObjectId;   // Denormalized
  isPublished: boolean;
  isActive: boolean;
  scheduledAt?: Date;        // Optional — for daily scheduled quizzes
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const QuizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Quiz format
    type: {
      type: String,
      enum: ["mcq", "subjective", "mixed"],
      default: "mcq",
    },

    // AI will auto-tag difficulty, admin can override
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // Time limit in minutes e.g. 30
    duration: {
      type: Number,
      required: true,
      default: 30,
    },

    // Sum of all question marks inside this quiz
    totalMarks: {
      type: Number,
      required: true,
      default: 0,
    },

    // Parent references
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

    // Draft until admin publishes
    isPublished: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Optional scheduled date for daily quizzes
    // e.g. quiz goes live at 8AM on a specific day
    scheduledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───────────────────────────────────────────────────

// Fetch quizzes by chapter
QuizSchema.index({ chapterId: 1 });

// Fetch scheduled quizzes — daily quiz feature
QuizSchema.index({ scheduledAt: 1, isPublished: 1 });

// Admin overview by class
QuizSchema.index({ classId: 1, isPublished: 1 });

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
