import express, { Application, Request, Response } from "express";
import cors from "cors";
import { ENV } from "./config/env";
import authRoutes from "./routes/auth.routes";
// import session from "express-session";
import { session } from "passport";
import classRoutes from "./routes/class.routes";
import quizRoutes from "./routes/quiz.routes";
import subjectRoutes from "./routes/subject.routes";
import chapterRoutes from "./routes/chapter.routes";
import noteRoutes from "./routes/note.routes";
import questionRoutes from "./routes/question.routes";
import flashcardRoutes from "./routes/flashcard.routes";
import testResultRoutes from "./routes/testResult.routes";
import assignmentRoutes from "./routes/assignment.routes";

const app: Application = express();

// ─── Middlewares ───────────────────────────────────────────────
app.use(cors({ origin: ENV.NODE_ENV === "development" ? "*" : "" }));
app.use(express.json());                    // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// ─── Session — required by Passport internally ─────────────────
app.use(session({
  secret: ENV.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));
// ─── Root Route ────────────────────────────────────────────────
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to MindScapio API",
    version: "1.0.0",
    health: "/api/health",
  });
});

// ─── Health Check ──────────────────────────────────────────────
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Server is running",
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes (uncomment as we build) ───────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/quizzes", quizRoutes);
// app.use("/api/notes", notesRoutes);
// app.use("/api/students", studentRoutes);
// app.use("/api/tests", testRoutes);

// app.use("/api/auth", authRoutes);
// app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/notes", noteRoutes);
// app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/test-results", testResultRoutes);
app.use("/api/assignments", assignmentRoutes);

import { errorHandler } from "./middleware/error.middleware";

// ─── Global Error Handler ──────────────────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler);
export default app;
