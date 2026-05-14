import { Request, Response, NextFunction } from "express";
import Class from "../models/Class.model";
import { AppError, sendResponse } from "../middleware/error.middleware";

// @route   POST /api/classes
// @desc    Create a new class
// @access  Protected — admin only
export const createClass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, grade, description } = req.body;

    // Check if class with same grade already exists
    const existing = await Class.findOne({ grade });
    if (existing) {
      throw new AppError(`Class ${grade} already exists`, 400);
    }

    const newClass = await Class.create({ name, grade, description });

    sendResponse(res, 201, true, "Class created successfully", newClass);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/classes
// @desc    Get all active classes sorted by grade
// @access  Public
export const getAllClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const classes = await Class.find({ isActive: true })
      .sort({ grade: 1 })    // Sort Class 1 → 10
      .select("-__v");

    sendResponse(res, 200, true, "Classes fetched successfully", classes);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/classes/:id
// @desc    Get a single class by ID
// @access  Public
export const getClassById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-__v");

    if (!classData) {
      throw new AppError("Class not found", 404);
    }

    sendResponse(res, 200, true, "Class fetched successfully", classData);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/classes/:id
// @desc    Update class name or description
// @access  Protected — admin only
export const updateClass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, isActive } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedClass) {
      throw new AppError("Class not found", 404);
    }

    sendResponse(res, 200, true, "Class updated successfully", updatedClass);
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/classes/:id
// @desc    Soft delete a class — sets isActive to false
// @access  Protected — admin only
export const deleteClass = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deletedClass) {
      throw new AppError("Class not found", 404);
    }

    sendResponse(res, 200, true, "Class deleted successfully", null);
  } catch (error) {
    next(error);
  }
};
