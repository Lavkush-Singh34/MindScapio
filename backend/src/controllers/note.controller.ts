import { Request, Response, NextFunction } from "express";
import Note from "../models/Note.model";
import Chapter from "../models/Chapter.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/notes
// @desc    Create a new note under a chapter
// @access  Protected — admin, teacher
export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, content, chapterId, subjectId, classId } = req.body;

    // Verify parent chapter exists and is active
    const parentChapter = await Chapter.findOne({
      _id: chapterId,
      isActive: true,
    });
    if (!parentChapter) {
      throw new AppError("Chapter not found or inactive", 404);
    }

    const note = await Note.create({
      title,
      content,
      chapterId,
      subjectId,
      classId,
    });

    sendResponse(res, 201, true, "Note created successfully", note);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/notes?chapterId=xxx
// @desc    Get all published notes for a chapter
// @access  Public
export const getNotesByChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      throw new AppError("chapterId query param is required", 400);
    }

    const notes = await Note.find({
      chapterId,
      isActive: true,
      isPublished: true,
    })
      .sort({ createdAt: -1 })   // Newest first
      .select("-__v");

    sendResponse(res, 200, true, "Notes fetched successfully", notes);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/notes/admin?chapterId=xxx
// @desc    Get all notes including drafts — for admin panel
// @access  Protected — admin, teacher
export const getAllNotesByChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      throw new AppError("chapterId query param is required", 400);
    }

    const notes = await Note.find({
      chapterId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    sendResponse(res, 200, true, "Notes fetched successfully", notes);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/notes/:id
// @desc    Get a single note by ID with full content
// @access  Public
export const getNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      isActive: true,
      isPublished: true,
    })
      .populate("chapterId", "name slug")    // Chapter info
      .populate("subjectId", "name slug")    // Subject info
      .populate("classId", "name grade")     // Class info
      .select("-__v");

    if (!note) {
      throw new AppError("Note not found", 404);
    }

    sendResponse(res, 200, true, "Note fetched successfully", note);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/notes/:id
// @desc    Update note title or content
// @access  Protected — admin, teacher
export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, content, isPublished, isActive } = req.body;

    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, isPublished, isActive },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updated) {
      throw new AppError("Note not found", 404);
    }

    sendResponse(res, 200, true, "Note updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/notes/:id/publish
// @desc    Toggle publish status of a note
// @access  Protected — admin, teacher
export const togglePublishNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      throw new AppError("Note not found", 404);
    }

    // Toggle current publish status
    note.isPublished = !note.isPublished;
    await note.save();

    sendResponse(
      res,
      200,
      true,
      `Note ${note.isPublished ? "published" : "unpublished"} successfully`,
      note
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/notes/:id
// @desc    Soft delete note
// @access  Protected — admin only
export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Note.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      throw new AppError("Note not found", 404);
    }

    sendResponse(res, 200, true, "Note deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
