import mongoose, { Document, Schema } from "mongoose";

// ─── Interface ─────────────────────────────────────────────────
export interface ISubject extends Document {
  name: string;              // e.g. "Mathematics", "Science"
  slug: string;              // e.g. "mathematics" — used in URLs
  icon?: string;             // Emoji or icon name e.g. "📐"
  classId: mongoose.Types.ObjectId; // Belongs to which class
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const SubjectSchema = new Schema<ISubject>(
  {
    // Subject display name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // URL-friendly version of name e.g. "social-science"
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Optional icon for visual identity on subject cards
    icon: {
      type: String,
      default: "📚",
    },

    // Reference to parent Class
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    // Admin can hide a subject without deleting its chapters
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound index — slug must be unique within a class ───────
// e.g. Class 6 and Class 7 can both have "mathematics" slug
SubjectSchema.index({ classId: 1, slug: 1 }, { unique: true });

export default mongoose.model<ISubject>("Subject", SubjectSchema);
