import mongoose from "mongoose";
import Class from "../models/Class.model";
import { ENV } from "./env";

const seedClasses = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("MongoDB connected");

    // ── Delete existing classes ────────────────────────────
    await Class.deleteMany({});

    // ── Seed Class 1–10 ───────────────────────────────────
    const classes = Array.from({ length: 10 }, (_, i) => ({
      name: `Class ${i + 1}`,
      grade: i + 1,
      description: `Content for Class ${i + 1} students`,
      isActive: true,
    }));

    await Class.insertMany(classes);
    console.log("✅ Classes 1–10 seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedClasses();
