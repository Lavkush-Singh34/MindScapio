import { Request, Response, NextFunction } from "express";
import Quiz from "../models/Quiz.model";
import Chapter from "../models/Chapter.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/quizzes
// @desc    Create a new quiz under a chapter
// @access  Protected — admin, teacher
export const createQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      type,
      difficulty,
      duration,
      totalMarks,
      chapterId,
      subjectId,
      classId,
      scheduledAt,
    } = req.body;

    // Verify parent chapter exists and is active
    const parentChapter = await Chapter.findOne({
      _id: chapterId,
      isActive: true,
    });
    if (!parentChapter) {
      throw new AppError("Chapter not found or inactive", 404);
    }

    const quiz = await Quiz.create({
      title,
      description,
      type,
      difficulty,
      duration,
      totalMarks,
      chapterId,
      subjectId,
      classId,
      scheduledAt,
    });

    sendResponse(res, 201, true, "Quiz created successfully", quiz);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/quizzes?chapterId=xxx
// @desc    Get all published quizzes for a chapter
// @access  Public
export const getQuizzesByChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      throw new AppError("chapterId query param is required", 400);
    }

    const quizzes = await Quiz.find({
      chapterId,
      isActive: true,
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    sendResponse(res, 200, true, "Quizzes fetched successfully", quizzes);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/quizzes/admin?chapterId=xxx
// @desc    Get all quizzes including drafts — admin panel
// @access  Protected — admin, teacher
export const getAllQuizzesByChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      throw new AppError("chapterId query param is required", 400);
    }

    const quizzes = await Quiz.find({
      chapterId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    sendResponse(res, 200, true, "Quizzes fetched successfully", quizzes);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/quizzes/scheduled?classId=xxx
// @desc    Get today's scheduled quizzes for a class
// @access  Public
export const getScheduledQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { classId } = req.query;

    if (!classId) {
      throw new AppError("classId query param is required", 400);
    }

    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const quizzes = await Quiz.find({
      classId,
      isActive: true,
      isPublished: true,
      scheduledAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .sort({ scheduledAt: 1 })
      .select("-__v");

    sendResponse(
      res,
      200,
      true,
      "Scheduled quizzes fetched successfully",
      quizzes
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/quizzes/:id
// @desc    Get a single quiz by ID
// @access  Public
export const getQuizById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      isActive: true,
      isPublished: true,
    })
      .populate("chapterId", "name slug")
      .populate("subjectId", "name slug")
      .populate("classId", "name grade")
      .select("-__v");

    if (!quiz) {
      throw new AppError("Quiz not found", 404);
    }

    sendResponse(res, 200, true, "Quiz fetched successfully", quiz);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/quizzes/:id
// @desc    Update quiz details
// @access  Protected — admin, teacher
export const updateQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      type,
      difficulty,
      duration,
      totalMarks,
      isPublished,
      isActive,
      scheduledAt,
    } = req.body;

    const updated = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        type,
        difficulty,
        duration,
        totalMarks,
        isPublished,
        isActive,
        scheduledAt,
      },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updated) {
      throw new AppError("Quiz not found", 404);
    }

    sendResponse(res, 200, true, "Quiz updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/quizzes/:id/publish
// @desc    Toggle publish status of a quiz
// @access  Protected — admin, teacher
export const togglePublishQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      throw new AppError("Quiz not found", 404);
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    sendResponse(
      res,
      200,
      true,
      `Quiz ${quiz.isPublished ? "published" : "unpublished"} successfully`,
      quiz
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/quizzes/:id
// @desc    Soft delete quiz
// @access  Protected — admin only
export const deleteQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      throw new AppError("Quiz not found", 404);
    }

    sendResponse(res, 200, true, "Quiz deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
