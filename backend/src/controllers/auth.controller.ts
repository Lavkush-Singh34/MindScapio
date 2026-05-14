import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User, { IUser } from "../models/User.model";
import { ENV } from "../config/env";
import { AppError, sendResponse } from "../middleware/error.middleware";

// ─── Generate JWT Token ────────────────────────────────────────
const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }        // Token valid for 7 days
  );
};

// ─── Configure Google OAuth Strategy ──────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: `${ENV.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update avatar in case Google profile picture changed
          user.avatar = profile.photos?.[0]?.value ?? user.avatar;
          await user.save();
          return done(null, user);
        }

        // First time login — create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value ?? "",
          displayName: profile.displayName,
          avatar: profile.photos?.[0]?.value ?? "",
          role: "parent",      // Default role on first Google login
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Passport serialize/deserialize — required for session handling
passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ─── Controllers ───────────────────────────────────────────────

// @route   GET /api/auth/google
// @desc    Redirect to Google OAuth consent screen
// @access  Public
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

// @route   GET /api/auth/google/callback
// @desc    Google redirects here after user consents
// @access  Public
export const googleAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate(
    "google",
    { session: false },
    (err: Error, user: IUser) => {
      try {
        if (err || !user) {
          throw new AppError("Google authentication failed", 401);
        }

        // Generate JWT token
        const token = generateToken(user);

        // Redirect to frontend with token in URL
        // Frontend extracts token and stores in localStorage
        res.redirect(`${ENV.CLIENT_URL}/auth/success?token=${token}`);
      } catch (error) {
        next(error);
      }
    }
  )(req, res, next);
};

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Protected
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id)
      .select("-__v")
      .populate("children", "displayName avatar class"); // Populate children for parent role

    if (!user) {
      throw new AppError("User not found", 404);
    }

    sendResponse(res, 200, true, "User profile fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/auth/update-profile
// @desc    Update display name or avatar
// @access  Protected
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { displayName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { displayName },
      { new: true, runValidators: true } // Return updated doc
    ).select("-__v");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    sendResponse(res, 200, true, "Profile updated successfully", user);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/add-child
// @desc    Parent adds a child profile with class assigned
// @access  Protected — parent only
export const addChild = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { displayName, class: studentClass } = req.body;

    // Create student user linked to parent
    const child = await User.create({
      googleId: `child_${Date.now()}`, // Placeholder — children don't login via Google
      email: `child_${Date.now()}@mindscapio.local`, // Placeholder email
      displayName,
      role: "student",
      class: studentClass,
      parentId: req.user?.id,
    });

    // Add child to parent's children array
    await User.findByIdAndUpdate(req.user?.id, {
      $push: { children: child._id },
    });

    sendResponse(res, 201, true, "Child added successfully", child);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/logout
// @desc    Logout — handled on frontend by clearing token
// @access  Protected
export const logout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // JWT is stateless — actual logout happens on frontend
  // by removing token from localStorage
  sendResponse(res, 200, true, "Logged out successfully", null);
};
