import mongoose, { Document, Schema } from "mongoose";

// ─── Types ─────────────────────────────────────────────────────
export type AssignmentStatus = "draft" | "published" | "closed";

// ─── Interface ─────────────────────────────────────────────────
export interface IAssignment extends Document {
  title: string;             // e.g. "Chapter 1 Homework"
  description: string;       // Markdown — full assignment content
  instructions?: string;     // Markdown — how to submit, what to include
  totalMarks: number;
  dueDate: Date;             // Deadline for submission
  status: AssignmentStatus;  // draft | published | closed
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId; // Denormalized
  classId: mongoose.Types.ObjectId;   // Denormalized
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const AssignmentSchema = new Schema<IAssignment>(
  {
    // Assignment title shown in list
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Full assignment content in Markdown
    // AI generated or manually written by admin
    description: {
      type: String,
      required: true,
    },

    // Optional submission instructions
    // e.g. "Write answers in your notebook and submit photo"
    instructions: {
      type: String,
      trim: true,
      default: "",
    },

    // Total marks for this assignment
    totalMarks: {
      type: Number,
      required: true,
      default: 10,
    },

    // Submission deadline
    dueDate: {
      type: Date,
      required: true,
    },

    // draft   → admin still preparing
    // published → students can see and work on it
    // closed  → past due date, no more submissions
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
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

    // Soft delete
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

// Fetch assignments by chapter
AssignmentSchema.index({ chapterId: 1 });

// Fetch upcoming assignments by class sorted by due date
AssignmentSchema.index({ classId: 1, dueDate: 1 });

// Filter published assignments by class
AssignmentSchema.index({ classId: 1, status: 1 });

export default mongoose.model<IAssignment>("Assignment", AssignmentSchema);
