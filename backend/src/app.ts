import express, { Application, Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { ENV } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";

// ─── Routes ────────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes";
import classRoutes from "./routes/class.routes";
import subjectRoutes from "./routes/subject.routes";
import chapterRoutes from "./routes/chapter.routes";
import noteRoutes from "./routes/note.routes";
import quizRoutes from "./routes/quiz.routes";
import questionRoutes from "./routes/question.routes";
import flashcardRoutes from "./routes/flashcard.routes";
import testResultRoutes from "./routes/testResult.routes";
import assignmentRoutes from "./routes/assignment.routes";

const app: Application = express();

// ─── Middlewares ───────────────────────────────────────────────
app.use(cors({ origin: ENV.NODE_ENV === "development" ? "*" : "" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session + Passport ────────────────────────────────────────
app.use(session({
  secret: ENV.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());            // No passport.session() — we use JWT

// ─── Root Route ────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to MindScapio API",
    version: "1.0.0",
    health: "/api/health",
  });
});

// ─── Health Check ──────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Server is running",
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/test-results", testResultRoutes);
app.use("/api/assignments", assignmentRoutes);

// ─── Global Error Handler — must be last ──────────────────────
app.use(errorHandler);

export default app;
