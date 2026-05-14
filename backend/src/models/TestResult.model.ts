import mongoose, { Document, Schema } from "mongoose";

// ─── Types ─────────────────────────────────────────────────────
export type AttemptStatus = "in_progress" | "completed" | "abandoned";

// ─── Individual answer snapshot ────────────────────────────────
export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  questionText: string;      // Snapshot — in case question is edited later
  type: string;
  marks: number;             // Marks this question carried

  // Student's response
  selectedOption?: number;   // MCQ — index of selected option
  writtenAnswer?: string;    // Subjective — student's written answer
  booleanAnswer?: boolean;   // True/False

  // Result
  isCorrect?: boolean;       // null for subjective until manually marked
  marksObtained: number;     // 0 if wrong, full marks if correct
}

// ─── Interface ─────────────────────────────────────────────────
export interface ITestResult extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId; // Denormalized
  classId: mongoose.Types.ObjectId;   // Denormalized

  answers: IAnswer[];        // Full snapshot of all answers

  // Score summary
  totalMarks: number;        // Total marks of the quiz
  marksObtained: number;     // Marks student got
  percentage: number;        // Auto calculated
  isPassed: boolean;         // Based on 40% passing threshold

  status: AttemptStatus;     // in_progress | completed | abandoned
  timeTaken: number;         // Time taken in seconds
  attemptNumber: number;     // 1st attempt, 2nd attempt etc.

  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Answer Sub-schema ─────────────────────────────────────────
const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    // Snapshot of question text at time of attempt
    // Ensures result history stays accurate even if question is edited
    questionText: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    marks: {
      type: Number,
      required: true,
    },

    // ── Student responses ───────────────────────────────────────
    selectedOption: {
      type: Number,
      default: undefined,
    },
    writtenAnswer: {
      type: String,
      default: undefined,
    },
    booleanAnswer: {
      type: Boolean,
      default: undefined,
    },

    // ── Evaluation ──────────────────────────────────────────────
    isCorrect: {
      type: Boolean,
      default: undefined,    // Undefined for subjective until manually marked
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }             // No separate _id for subdocuments
);

// ─── TestResult Schema ─────────────────────────────────────────
const TestResultSchema = new Schema<ITestResult>(
  {
    // Who attempted
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which quiz
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    // Parent references — denormalized for fast queries
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

    // Full answer history — embedded for fast retrieval
    answers: [AnswerSchema],

    // ── Score summary ───────────────────────────────────────────
    totalMarks: {
      type: Number,
      required: true,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },

    // Stored directly — avoids recalculating every time
    percentage: {
      type: Number,
      default: 0,
    },

    // 40% is passing threshold
    isPassed: {
      type: Boolean,
      default: false,
    },

    // ── Attempt tracking ────────────────────────────────────────
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },

    // Time taken in seconds — shown in result summary
    timeTaken: {
      type: Number,
      default: 0,
    },

    // Tracks if student is retaking the quiz
    attemptNumber: {
      type: Number,
      default: 1,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───────────────────────────────────────────────────

// Fetch all attempts by a student
TestResultSchema.index({ studentId: 1 });

// Fetch student's attempts on a specific quiz
TestResultSchema.index({ studentId: 1, quizId: 1 });

// Parent overview — all results in a class
TestResultSchema.index({ classId: 1, studentId: 1 });

// Leaderboard — top scores in a quiz
TestResultSchema.index({ quizId: 1, percentage: -1 });

export default mongoose.model<ITestResult>("TestResult", TestResultSchema);
