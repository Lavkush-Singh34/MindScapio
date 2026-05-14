import { Request, Response, NextFunction } from "express";
import Subject from "../models/Subject.model";
import Class from "../models/Class.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/subjects
// @desc    Create a new subject under a class
// @access  Protected — admin, teacher
export const createSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, icon, classId } = req.body;

    // Verify parent class exists and is active
    const parentClass = await Class.findOne({ _id: classId, isActive: true });
    if (!parentClass) {
      throw new AppError("Class not found or inactive", 404);
    }

    // Check duplicate slug within same class
    const existing = await Subject.findOne({ classId, slug });
    if (existing) {
      throw new AppError(
        `Subject with slug "${slug}" already exists in this class`,
        400
      );
    }

    const subject = await Subject.create({ name, slug, icon, classId });

    sendResponse(res, 201, true, "Subject created successfully", subject);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/subjects?classId=xxx
// @desc    Get all active subjects for a class
// @access  Public
export const getSubjectsByClass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { classId } = req.query;

    if (!classId) {
      throw new AppError("classId query param is required", 400);
    }

    const subjects = await Subject.find({
      classId,
      isActive: true,
    })
      .sort({ name: 1 })       // Alphabetical order
      .select("-__v");

    sendResponse(res, 200, true, "Subjects fetched successfully", subjects);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/subjects/:id
// @desc    Get a single subject by ID
// @access  Public
export const getSubjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("classId", "name grade") // Show class name + grade
      .select("-__v");

    if (!subject) {
      throw new AppError("Subject not found", 404);
    }

    sendResponse(res, 200, true, "Subject fetched successfully", subject);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/subjects/:id
// @desc    Update subject
// @access  Protected — admin, teacher
export const updateSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, icon, isActive } = req.body;

    // If slug is being updated check for duplicates within same class
    if (slug) {
      const subject = await Subject.findById(req.params.id);
      if (!subject) {
        throw new AppError("Subject not found", 404);
      }

      const duplicate = await Subject.findOne({
        classId: subject.classId,
        slug,
        _id: { $ne: req.params.id }, // Exclude current subject
      });

      if (duplicate) {
        throw new AppError(
          `Subject with slug "${slug}" already exists in this class`,
          400
        );
      }
    }

    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, slug, icon, isActive },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updated) {
      throw new AppError("Subject not found", 404);
    }

    sendResponse(res, 200, true, "Subject updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/subjects/:id
// @desc    Soft delete subject
// @access  Protected — admin only
export const deleteSubject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deleted = await Subject.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      throw new AppError("Subject not found", 404);
    }

    sendResponse(res, 200, true, "Subject deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
