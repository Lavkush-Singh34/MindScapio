import mongoose, { Document, Schema } from "mongoose";

// ─── Interface ─────────────────────────────────────────────────
export interface IClass extends Document {
  name: string;              // e.g. "Class 6"
  grade: number;             // 1–10
  description?: string;      // Optional short description
  isActive: boolean;         // Hide a class without deleting
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const ClassSchema = new Schema<IClass>(
  {
    // Display name shown to students
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,          // No duplicate class names
    },

    // Numeric grade for sorting/filtering (1–10)
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      unique: true,
    },

    // Optional info shown on class card
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Admin can deactivate a class without deleting its content
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,        // Auto createdAt & updatedAt
  }
);

// ─── Index for faster grade-based queries ──────────────────────
ClassSchema.index({ grade: 1 });

export default mongoose.model<IClass>("Class", ClassSchema);
