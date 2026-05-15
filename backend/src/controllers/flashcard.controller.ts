import { Request, Response, NextFunction } from "express";
import Flashcard from "../models/Flashcard.model";
import Chapter from "../models/Chapter.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/flashcards
// @desc    Create a new flashcard under a chapter
// @access  Protected — admin, teacher
export const createFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      front,
      back,
      hint,
      difficulty,
      order,
      chapterId,
      subjectId,
      classId,
    } = req.body;

    // Verify parent chapter exists and is active
    const parentChapter = await Chapter.findOne({
      _id: chapterId,
      isActive: true,
    });
    if (!parentChapter) {
      throw new AppError("Chapter not found or inactive", 404);
    }

    const flashcard = await Flashcard.create({
      front,
      back,
      hint,
      difficulty,
      order,
      chapterId,
      subjectId,
      classId,
    });

    sendResponse(res, 201, true, "Flashcard created successfully", flashcard);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/flashcards/bulk
// @desc    Create multiple flashcards at once — for AI generated batches
// @access  Protected — admin, teacher
export const createBulkFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { flashcards, chapterId, subjectId, classId } = req.body;

    // Verify parent chapter exists and is active
    const parentChapter = await Chapter.findOne({
      _id: chapterId,
      isActive: true,
    });
    if (!parentChapter) {
      throw new AppError("Chapter not found or inactive", 404);
    }

    // Attach chapterId, subjectId, classId to each flashcard
    const flashcardsWithParents = flashcards.map(
      (
        card: { front: string; back: string; hint?: string; difficulty?: string },
        index: number
      ) => ({
        ...card,
        chapterId,
        subjectId,
        classId,
        order: index + 1,    // Auto assign order based on array position
      })
    );

    const created = await Flashcard.insertMany(flashcardsWithParents);

    sendResponse(
      res,
      201,
      true,
      `${created.length} flashcards created successfully`,
      created
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/flashcards?chapterId=xxx
// @desc    Get all published flashcards for a chapter
// @access  Public
export const getFlashcardsByChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId, difficulty } = req.query;

    if (!chapterId) {
      throw new AppError("chapterId query param is required", 400);
    }

    // Build query — optionally filter by difficulty
    const query: Record<string, unknown> = {
      chapterId,
      isActive: true,
      isPublished: true,
    };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const flashcards = await Flashcard.find(query)
      .sort({ order: 1 })    // Sorted by order for deck sequence
      .select("-__v");

    sendResponse(res, 200, true, "Flashcards fetched successfully", flashcards);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/flashcards/admin?chapterId=xxx
// @desc    Get all flashcards including drafts — admin panel
// @access  Protected — admin, teacher
export const getAllFlashcardsByChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      throw new AppError("chapterId query param is required", 400);
    }

    const flashcards = await Flashcard.find({
      chapterId,
      isActive: true,
    })
      .sort({ order: 1 })
      .select("-__v");

    sendResponse(res, 200, true, "Flashcards fetched successfully", flashcards);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/flashcards/:id
// @desc    Get a single flashcard by ID
// @access  Public
export const getFlashcardById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("chapterId", "name slug")
      .populate("subjectId", "name slug")
      .populate("classId", "name grade")
      .select("-__v");

    if (!flashcard) {
      throw new AppError("Flashcard not found", 404);
    }

    sendResponse(res, 200, true, "Flashcard fetched successfully", flashcard);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/flashcards/:id
// @desc    Update flashcard
// @access  Protected — admin, teacher
export const updateFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { front, back, hint, difficulty, order, isPublished, isActive } =
      req.body;

    const updated = await Flashcard.findByIdAndUpdate(
      req.params.id,
      { front, back, hint, difficulty, order, isPublished, isActive },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updated) {
      throw new AppError("Flashcard not found", 404);
    }

    sendResponse(res, 200, true, "Flashcard updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/flashcards/:id/publish
// @desc    Toggle publish status of a flashcard
// @access  Protected — admin, teacher
export const togglePublishFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      throw new AppError("Flashcard not found", 404);
    }

    flashcard.isPublished = !flashcard.isPublished;
    await flashcard.save();

    sendResponse(
      res,
      200,
      true,
      `Flashcard ${flashcard.isPublished ? "published" : "unpublished"} successfully`,
      flashcard
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/flashcards/:id
// @desc    Soft delete flashcard
// @access  Protected — admin only
export const deleteFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Flashcard.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      throw new AppError("Flashcard not found", 404);
    }

    sendResponse(res, 200, true, "Flashcard deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
