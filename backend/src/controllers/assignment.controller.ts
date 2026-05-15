import { Request, Response, NextFunction } from "express";
import Assignment from "../models/Assignment.model";
import Chapter from "../models/Chapter.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/assignments
// @desc    Create a new assignment under a chapter
// @access  Protected — admin, teacher
export const createAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      instructions,
      totalMarks,
      dueDate,
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

    // Ensure due date is in the future
    if (new Date(dueDate) <= new Date()) {
      throw new AppError("Due date must be in the future", 400);
    }

    const assignment = await Assignment.create({
      title,
      description,
      instructions,
      totalMarks,
      dueDate,
      chapterId,
      subjectId,
      classId,
    });

    sendResponse(res, 201, true, "Assignment created successfully", assignment);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/assignments?classId=xxx
// @desc    Get all published assignments for a class
// @access  Public
export const getAssignmentsByClass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { classId, subjectId } = req.query;

    if (!classId) {
      throw new AppError("classId query param is required", 400);
    }

    // Build query — optionally filter by subject
    const query: Record<string, unknown> = {
      classId,
      isActive: true,
      status: "published",
    };

    if (subjectId) {
      query.subjectId = subjectId;
    }

    const assignments = await Assignment.find(query)
      .populate("chapterId", "name slug")
      .populate("subjectId", "name slug icon")
      .sort({ dueDate: 1 })      // Closest due date first
      .select("-__v");

    sendResponse(
      res,
      200,
      true,
      "Assignments fetched successfully",
      assignments
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/assignments/admin?classId=xxx
// @desc    Get all assignments including drafts — admin panel
// @access  Protected — admin, teacher
export const getAllAssignmentsByClass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { classId, subjectId } = req.query;

    if (!classId) {
      throw new AppError("classId query param is required", 400);
    }

    const query: Record<string, unknown> = {
      classId,
      isActive: true,
    };

    if (subjectId) {
      query.subjectId = subjectId;
    }

    const assignments = await Assignment.find(query)
      .populate("chapterId", "name slug")
      .populate("subjectId", "name slug icon")
      .sort({ dueDate: 1 })
      .select("-__v");

    sendResponse(
      res,
      200,
      true,
      "Assignments fetched successfully",
      assignments
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/assignments/:id
// @desc    Get a single assignment by ID
// @access  Public
export const getAssignmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      isActive: true,
      status: "published",
    })
      .populate("chapterId", "name slug")
      .populate("subjectId", "name slug icon")
      .populate("classId", "name grade")
      .select("-__v");

    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }

    sendResponse(
      res,
      200,
      true,
      "Assignment fetched successfully",
      assignment
    );
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/assignments/:id
// @desc    Update assignment details
// @access  Protected — admin, teacher
export const updateAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      instructions,
      totalMarks,
      dueDate,
      status,
      isActive,
    } = req.body;

    // Validate due date if being updated
    if (dueDate && new Date(dueDate) <= new Date()) {
      throw new AppError("Due date must be in the future", 400);
    }

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, instructions, totalMarks, dueDate, status, isActive },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updated) {
      throw new AppError("Assignment not found", 404);
    }

    sendResponse(res, 200, true, "Assignment updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/assignments/:id/status
// @desc    Update assignment status — draft, published, closed
// @access  Protected — admin, teacher
export const updateAssignmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }

    // Enforce valid status transitions
    // draft → published → closed (no going back)
    const validTransitions: Record<string, string[]> = {
      draft: ["published"],
      published: ["closed"],
      closed: [],
    };

    if (!validTransitions[assignment.status].includes(status)) {
      throw new AppError(
        `Cannot transition from "${assignment.status}" to "${status}"`,
        400
      );
    }

    assignment.status = status;
    await assignment.save();

    sendResponse(
      res,
      200,
      true,
      `Assignment ${status} successfully`,
      assignment
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/assignments/:id
// @desc    Soft delete assignment
// @access  Protected — admin only
export const deleteAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Assignment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      throw new AppError("Assignment not found", 404);
    }

    sendResponse(res, 200, true, "Assignment deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
