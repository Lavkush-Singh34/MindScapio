import { Request, Response, NextFunction } from "express";
import TestResult from "../models/TestResult.model";
import Question from "../models/Question.model";
import Quiz from "../models/Quiz.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/test-results/start
// @desc    Start a quiz attempt
// @access  Protected — student, parent
export const startQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { quizId, chapterId, subjectId, classId } = req.body;
    const studentId = req.user?.id;

    // Verify quiz exists and is published
    const quiz = await Quiz.findOne({
      _id: quizId,
      isActive: true,
      isPublished: true,
    });
    if (!quiz) {
      throw new AppError("Quiz not found or not available", 404);
    }

    // Check if student has an in_progress attempt already
    const existingAttempt = await TestResult.findOne({
      studentId,
      quizId,
      status: "in_progress",
    });
    if (existingAttempt) {
      // Return existing attempt instead of creating new one
      sendResponse(
        res,
        200,
        true,
        "Resuming existing attempt",
        existingAttempt
      );
      return;
    }

    // Get attempt number — how many times student has attempted this quiz
    const attemptCount = await TestResult.countDocuments({
      studentId,
      quizId,
    });

    const testResult = await TestResult.create({
      studentId,
      quizId,
      chapterId,
      subjectId,
      classId,
      totalMarks: quiz.totalMarks,
      status: "in_progress",
      attemptNumber: attemptCount + 1,
      startedAt: new Date(),
    });

    sendResponse(res, 201, true, "Quiz started successfully", testResult);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/test-results/submit
// @desc    Submit quiz answers and calculate score
// @access  Protected — student, parent
export const submitQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { testResultId, answers } = req.body;
    const studentId = req.user?.id;

    // Find the in_progress attempt
    const testResult = await TestResult.findOne({
      _id: testResultId,
      studentId,
      status: "in_progress",
    });
    if (!testResult) {
      throw new AppError("Quiz attempt not found or already submitted", 404);
    }

    // Fetch all questions for this quiz with correct answers
    const questions = await Question.find({
      quizId: testResult.quizId,
      isActive: true,
    });

    // Build a map for fast lookup — questionId → question
    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q])
    );

    let marksObtained = 0;
    const evaluatedAnswers = answers.map(
      (answer: {
        questionId: string;
        selectedOption?: number;
        writtenAnswer?: string;
        booleanAnswer?: boolean;
      }) => {
        const question = questionMap.get(answer.questionId);

        if (!question) {
          return {
            questionId: answer.questionId,
            questionText: "",
            type: "unknown",
            marks: 0,
            marksObtained: 0,
          };
        }

        let isCorrect: boolean | undefined = undefined;
        let questionMarksObtained = 0;

        // ── Evaluate based on question type ─────────────────────
        if (question.type === "mcq") {
          isCorrect = answer.selectedOption === question.correctOption;
          questionMarksObtained = isCorrect ? question.marks : 0;
          marksObtained += questionMarksObtained;
        }

        if (question.type === "true_false") {
          isCorrect = answer.booleanAnswer === question.correctAnswer;
          questionMarksObtained = isCorrect ? question.marks : 0;
          marksObtained += questionMarksObtained;
        }

        // Subjective — not auto evaluated, marked manually later
        if (question.type === "subjective") {
          isCorrect = undefined;
          questionMarksObtained = 0;
        }

        return {
          questionId: question._id,
          questionText: question.questionText, // Snapshot
          type: question.type,
          marks: question.marks,
          selectedOption: answer.selectedOption,
          writtenAnswer: answer.writtenAnswer,
          booleanAnswer: answer.booleanAnswer,
          isCorrect,
          marksObtained: questionMarksObtained,
        };
      }
    );

    // Calculate final score
    const percentage = testResult.totalMarks > 0
      ? Math.round((marksObtained / testResult.totalMarks) * 100)
      : 0;

    const isPassed = percentage >= 40; // 40% passing threshold

    // Update test result with evaluated answers
    testResult.answers = evaluatedAnswers;
    testResult.marksObtained = marksObtained;
    testResult.percentage = percentage;
    testResult.isPassed = isPassed;
    testResult.status = "completed";
    testResult.completedAt = new Date();
    testResult.timeTaken = Math.round(
      (new Date().getTime() - testResult.startedAt.getTime()) / 1000
    ); // Time in seconds

    await testResult.save();

    sendResponse(res, 200, true, "Quiz submitted successfully", testResult);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/test-results/student?studentId=xxx
// @desc    Get all quiz attempts by a student
// @access  Protected — student sees own, parent sees child's, admin sees all
export const getStudentResults = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { studentId } = req.query;
    const requestingUser = req.user;

    // Students can only see their own results
    if (
      requestingUser?.role === "student" &&
      studentId !== requestingUser.id
    ) {
      throw new AppError("You can only view your own results", 403);
    }

    const results = await TestResult.find({
      studentId: studentId ?? requestingUser?.id,
      status: "completed",
    })
      .populate("quizId", "title type difficulty duration")
      .populate("chapterId", "name slug")
      .populate("subjectId", "name slug")
      .populate("classId", "name grade")
      .sort({ createdAt: -1 })  // Most recent first
      .select("-answers -__v");  // Exclude full answers in list view

    sendResponse(res, 200, true, "Results fetched successfully", results);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/test-results/:id
// @desc    Get a single test result with full answers
// @access  Protected — student sees own, admin sees all
export const getResultById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await TestResult.findById(req.params.id)
      .populate("quizId", "title type difficulty duration totalMarks")
      .populate("chapterId", "name slug")
      .populate("subjectId", "name slug")
      .populate("classId", "name grade")
      .select("-__v");

    if (!result) {
      throw new AppError("Result not found", 404);
    }

    // Students can only view their own results
    if (
      req.user?.role === "student" &&
      result.studentId.toString() !== req.user.id
    ) {
      throw new AppError("You can only view your own results", 403);
    }

    sendResponse(res, 200, true, "Result fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/test-results/leaderboard?quizId=xxx
// @desc    Get top 10 scores for a quiz
// @access  Public
export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { quizId } = req.query;

    if (!quizId) {
      throw new AppError("quizId query param is required", 400);
    }

    const leaderboard = await TestResult.find({
      quizId,
      status: "completed",
    })
      .populate("studentId", "displayName avatar")
      .sort({ percentage: -1, timeTaken: 1 }) // Highest score first, fastest time breaks tie
      .limit(10)
      .select("studentId marksObtained totalMarks percentage timeTaken attemptNumber -__v");

    sendResponse(
      res,
      200,
      true,
      "Leaderboard fetched successfully",
      leaderboard
    );
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/test-results/:id/abandon
// @desc    Abandon an in_progress quiz attempt
// @access  Protected — student
export const abandonQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await TestResult.findOne({
      _id: req.params.id,
      studentId: req.user?.id,
      status: "in_progress",
    });

    if (!result) {
      throw new AppError("Active quiz attempt not found", 404);
    }

    result.status = "abandoned";
    result.completedAt = new Date();
    await result.save();

    sendResponse(res, 200, true, "Quiz abandoned", null);
  } catch (error) {
    next(error);
  }
};
