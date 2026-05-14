import mongoose, { Document, Schema } from "mongoose";

// ─── Interface ─────────────────────────────────────────────────
export interface IChapter extends Document {
  name: string;              // e.g. "Chapter 1: The French Revolution"
  slug: string;              // e.g. "the-french-revolution"
  order: number;             // Chapter order within subject e.g. 1, 2, 3
  description?: string;      // Brief overview of the chapter
  subjectId: mongoose.Types.ObjectId; // Belongs to which subject
  classId: mongoose.Types.ObjectId;   // Denormalized for faster queries
  isPublished: boolean;      // Draft vs Published — students only see published
  isActive: boolean;         // Soft delete
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const ChapterSchema = new Schema<IChapter>(
  {
    // Full chapter name with number
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // URL-friendly slug e.g. "french-revolution"
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Controls display order in chapter list
    order: {
      type: Number,
      required: true,
      default: 1,
    },

    // Short summary shown on chapter card
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Parent subject reference
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // Stored here too so we can query chapters by class directly
    // without joining Subject every time
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    // Only published chapters are visible to students
    // Admin can keep drafts while preparing content
    isPublished: {
      type: Boolean,
      default: false,
    },

    // Soft delete — hide without losing content
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

// Slug unique within a subject
ChapterSchema.index({ subjectId: 1, slug: 1 }, { unique: true });

// Fast fetch of all chapters in a subject sorted by order
ChapterSchema.index({ subjectId: 1, order: 1 });

// Fast fetch of all chapters in a class (for admin overview)
ChapterSchema.index({ classId: 1 });

export default mongoose.model<IChapter>("Chapter", ChapterSchema);
