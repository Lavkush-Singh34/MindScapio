import mongoose, { Document, Schema } from "mongoose";

// ─── Types ─────────────────────────────────────────────────────
export type DifficultyLevel = "easy" | "medium" | "hard";

// ─── Interface ─────────────────────────────────────────────────
export interface IFlashcard extends Document {
  front: string;             // Question / Term / Concept (Markdown supported)
  back: string;              // Answer / Definition / Explanation (Markdown supported)
  hint?: string;             // Optional hint shown before revealing answer
  difficulty: DifficultyLevel;
  order: number;             // Display order within chapter
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId; // Denormalized
  classId: mongoose.Types.ObjectId;   // Denormalized
  isPublished: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const FlashcardSchema = new Schema<IFlashcard>(
  {
    // Front of card — term, concept or question
    // Supports Markdown so admin can add bold, italics, equations
    front: {
      type: String,
      required: true,
      trim: true,
    },

    // Back of card — answer or definition
    // Supports Markdown for rich explanations
    back: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional hint — shown to student before they flip the card
    hint: {
      type: String,
      trim: true,
      default: "",
    },

    // AI auto-tags difficulty, admin can override in panel
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // Controls display order in flashcard deck
    order: {
      type: Number,
      default: 0,
    },

    // Parent references
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    // Denormalized for faster subject/class level queries
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

    // Draft until admin reviews and publishes
    isPublished: {
      type: Boolean,
      default: false,
    },

    // Soft delete — never lose content
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

// Fetch all flashcards in a chapter sorted by order
FlashcardSchema.index({ chapterId: 1, order: 1 });

// Filter by difficulty within a chapter
FlashcardSchema.index({ chapterId: 1, difficulty: 1 });

// Admin overview by class
FlashcardSchema.index({ classId: 1, isPublished: 1 });

export default mongoose.model<IFlashcard>("Flashcard", FlashcardSchema);
