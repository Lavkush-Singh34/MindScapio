import { Request, Response, NextFunction } from "express";
import Question from "../models/Question.model";
import Quiz from "../models/Quiz.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/questions
// @desc    Create a new question under a quiz
// @access  Protected — admin, teacher
export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      questionText,
      type,
      difficulty,
      marks,
      options,
      correctOption,
      answerText,
      correctAnswer,
      explanation,
      quizId,
      chapterId,
      subjectId,
      classId,
    } = req.body;

    // Verify parent quiz exists and is active
    const parentQuiz = await Quiz.findOne({
      _id: quizId,
      isActive: true,
    });
    if (!parentQuiz) {
      throw new AppError("Quiz not found or inactive", 404);
    }

    // Validate type specific fields
    if (type === "mcq") {
      if (!options || options.length !== 4) {
        throw new AppError("MCQ questions must have exactly 4 options", 400);
      }
      if (correctOption === undefined || correctOption === null) {
        throw new AppError("MCQ questions must have a correct option", 400);
      }
    }

    if (type === "subjective" && !answerText) {
      throw new AppError("Subjective questions must have a model answer", 400);
    }

    if (type === "true_false" && correctAnswer === undefined) {
      throw new AppError(
        "True/False questions must have a correct answer",
        400
      );
    }

    const question = await Question.create({
      questionText,
      type,
      difficulty,
      marks,
      options,
      correctOption,
      answerText,
      correctAnswer,
      explanation,
      quizId,
      chapterId,
      subjectId,
      classId,
    });

    // Update quiz totalMarks by adding this question's marks
    await Quiz.findByIdAndUpdate(quizId, {
      $inc: { totalMarks: marks },
    });

    sendResponse(res, 201, true, "Question created successfully", question);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/questions?quizId=xxx
// @desc    Get all questions for a quiz
// @access  Protected — must be logged in to attempt quiz
export const getQuestionsByQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { quizId } = req.query;

    if (!quizId) {
      throw new AppError("quizId query param is required", 400);
    }

    // Hide correct answers from students
    // correctOption, answerText, correctAnswer excluded
    const questions = await Question.find({
      quizId,
      isActive: true,
    })
      .select("-correctOption -answerText -correctAnswer -__v")
      .sort({ createdAt: 1 }); // Oldest first — consistent order

    sendResponse(res, 200, true, "Questions fetched successfully", questions);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/questions/admin?quizId=xxx
// @desc    Get all questions with answers — admin panel
// @access  Protected — admin, teacher
export const getAllQuestionsByQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { quizId } = req.query;

    if (!quizId) {
      throw new AppError("quizId query param is required", 400);
    }

    // Full data including correct answers for admin
    const questions = await Question.find({
      quizId,
      isActive: true,
    })
      .select("-__v")
      .sort({ createdAt: 1 });

    sendResponse(res, 200, true, "Questions fetched successfully", questions);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/questions/:id
// @desc    Get single question with answer — admin only
// @access  Protected — admin, teacher
export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("quizId", "title type")
      .populate("chapterId", "name slug")
      .populate("subjectId", "name slug")
      .populate("classId", "name grade")
      .select("-__v");

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    sendResponse(res, 200, true, "Question fetched successfully", question);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/questions/:id
// @desc    Update question
// @access  Protected — admin, teacher
export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      questionText,
      type,
      difficulty,
      marks,
      options,
      correctOption,
      answerText,
      correctAnswer,
      explanation,
      isActive,
    } = req.body;

    // If marks changed update quiz totalMarks accordingly
    if (marks !== undefined) {
      const existing = await Question.findById(req.params.id);
      if (!existing) {
        throw new AppError("Question not found", 404);
      }

      const marksDiff = marks - existing.marks;
      if (marksDiff !== 0) {
        await Quiz.findByIdAndUpdate(existing.quizId, {
          $inc: { totalMarks: marksDiff },
        });
      }
    }

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      {
        questionText,
        type,
        difficulty,
        marks,
        options,
        correctOption,
        answerText,
        correctAnswer,
        explanation,
        isActive,
      },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updated) {
      throw new AppError("Question not found", 404);
    }

    sendResponse(res, 200, true, "Question updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/questions/:id
// @desc    Soft delete question and deduct marks from quiz
// @access  Protected — admin only
export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    // Deduct marks from quiz total
    await Quiz.findByIdAndUpdate(question.quizId, {
      $inc: { totalMarks: -question.marks },
    });

    // Soft delete
    question.isActive = false;
    await question.save();

    sendResponse(res, 200, true, "Question deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
