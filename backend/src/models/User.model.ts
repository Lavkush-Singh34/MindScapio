import mongoose, { Document, Schema } from "mongoose";

// ─── Types ─────────────────────────────────────────────────────
// export type UserRole = "admin" | "parent" | "student";
export type UserRole = "admin" | "parent" | "student";

export interface IUser extends Document {
  // Google OAuth fields
  googleId: string;
  email: string;
  displayName: string;       // From Google, editable later
  avatar: string;            // Google profile picture URL

  // Profile
  role: UserRole;
  isActive: boolean;

  // Parent specific — a parent can have multiple children
  children: mongoose.Types.ObjectId[];

  // Student specific
  class?: number;            // Class 1–10
  parentId?: mongoose.Types.ObjectId;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
  {
    // Google OAuth
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },

    // Role
    role: {
      type: String,
      enum: ["admin", "teacher", "parent", "student"],
      default: "parent",     // Default role after Google login
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Parent → children relationship
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",           // References other Users with student role
      },
    ],

    // Student specific fields
    class: {
      type: Number,
      min: 1,
      max: 10,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,          // Auto adds createdAt & updatedAt
  }
);

export default mongoose.model<IUser>("User", UserSchema);
