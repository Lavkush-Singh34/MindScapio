import { Request, Response, NextFunction } from "express";
import Chapter from "../models/Chapter.model";
import Subject from "../models/Subject.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/chapters
// @desc    Create a new chapter under a subject
// @access  Protected — admin, teacher
export const createChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, order, description, subjectId, classId } = req.body;

    // Verify parent subject exists and is active
    const parentSubject = await Subject.findOne({
      _id: subjectId,
      isActive: true,
    });
    if (!parentSubject) {
      throw new AppError("Subject not found or inactive", 404);
    }

    // Check duplicate slug within same subject
    const existing = await Chapter.findOne({ subjectId, slug });
    if (existing) {
      throw new AppError(
        `Chapter with slug "${slug}" already exists in this subject`,
        400
      );
    }

    const chapter = await Chapter.create({
      name,
      slug,
      order,
      description,
      subjectId,
      classId,
    });

    sendResponse(res, 201, true, "Chapter created successfully", chapter);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/chapters?subjectId=xxx
// @desc    Get all published chapters for a subject
// @access  Public
export const getChaptersBySubject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subjectId } = req.query;

    if (!subjectId) {
      throw new AppError("subjectId query param is required", 400);
    }

    const chapters = await Chapter.find({
      subjectId,
      isActive: true,
      isPublished: true,
    })
      .sort({ order: 1 })      // Sort by chapter order
      .select("-__v");

    sendResponse(res, 200, true, "Chapters fetched successfully", chapters);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/chapters/admin?subjectId=xxx
// @desc    Get all chapters including drafts — for admin panel
// @access  Protected — admin, teacher
export const getAllChaptersBySubject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subjectId } = req.query;

    if (!subjectId) {
      throw new AppError("subjectId query param is required", 400);
    }

    const chapters = await Chapter.find({
      subjectId,
      isActive: true,
    })
      .sort({ order: 1 })
      .select("-__v");

    sendResponse(res, 200, true, "Chapters fetched successfully", chapters);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/chapters/:id
// @desc    Get a single chapter by ID
// @access  Public
export const getChapterById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chapter = await Chapter.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("subjectId", "name slug")  // Subject name + slug
      .populate("classId", "name grade")   // Class name + grade
      .select("-__v");

    if (!chapter) {
      throw new AppError("Chapter not found", 404);
    }

    sendResponse(res, 200, true, "Chapter fetched successfully", chapter);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/chapters/:id
// @desc    Update chapter details
// @access  Protected — admin, teacher
export const updateChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, order, description, isPublished, isActive } = req.body;

    // If slug is being updated check for duplicates within same subject
    if (slug) {
      const chapter = await Chapter.findById(req.params.id);
      if (!chapter) {
        throw new AppError("Chapter not found", 404);
      }

      const duplicate = await Chapter.findOne({
        subjectId: chapter.subjectId,
        slug,
        _id: { $ne: req.params.id }, // Exclude current chapter
      });

      if (duplicate) {
        throw new AppError(
          `Chapter with slug "${slug}" already exists in this subject`,
          400
        );
      }
    }

    const updated = await Chapter.findByIdAndUpdate(
      req.params.id,
      { name, slug, order, description, isPublished, isActive },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updated) {
      throw new AppError("Chapter not found", 404);
    }

    sendResponse(res, 200, true, "Chapter updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/chapters/:id/publish
// @desc    Toggle publish status of a chapter
// @access  Protected — admin, teacher
export const togglePublishChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      throw new AppError("Chapter not found", 404);
    }

    // Toggle current publish status
    chapter.isPublished = !chapter.isPublished;
    await chapter.save();

    sendResponse(
      res,
      200,
      true,
      `Chapter ${chapter.isPublished ? "published" : "unpublished"} successfully`,
      chapter
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/chapters/:id
// @desc    Soft delete chapter
// @access  Protected — admin only
export const deleteChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Chapter.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      throw new AppError("Chapter not found", 404);
    }

    sendResponse(res, 200, true, "Chapter deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
