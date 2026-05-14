import mongoose, { Document, Schema } from "mongoose";

// ─── Interface ─────────────────────────────────────────────────
export interface INote extends Document {
  title: string;             // e.g. "The French Revolution — Summary"
  content: string;           // Markdown content (AI generated or manual)
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId; // Denormalized for faster queries
  classId: mongoose.Types.ObjectId;   // Denormalized for faster queries
  isPublished: boolean;      // Draft until admin publishes
  isActive: boolean;         // Soft delete
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const NoteSchema = new Schema<INote>(
  {
    // Note title shown in list
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Full Markdown content — rendered on frontend, PDF on demand
    content: {
      type: String,
      required: true,
    },

    // Parent references
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    // Denormalized — avoids extra lookups when fetching notes by subject/class
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

    // Students only see published notes
    isPublished: {
      type: Boolean,
      default: false,
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

// Fetch all notes in a chapter (most common query)
NoteSchema.index({ chapterId: 1 });

// Admin overview — all notes in a class
NoteSchema.index({ classId: 1, isPublished: 1 });

export default mongoose.model<INote>("Note", NoteSchema);
