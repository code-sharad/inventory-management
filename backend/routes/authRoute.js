require("dotenv").config();
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const AuthService = require("../services/authService");
const {
  authenticate,
  restrictTo,
  requireEmailVerification,
} = require("../middleware/auth");
const logger = require("../utils/logger");

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    status: "error",
    message: "Too many password reset attempts, please try again later.",
  },
});

const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 email verification requests per hour
  message: {
    status: "error",
    message: "Too many email verification attempts, please try again later.",
  },
});

// Validation middleware
const validateRegister = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_\s-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, spaces, underscores, and hyphens"
    ),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("role")
    .optional()
    .isIn(["user", "admin", "manager"])
    .withMessage("Invalid role specified"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),
];

const validatePasswordReset = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// AUTHENTICATION ROUTES

// Register
router.post(
  "/register",
  authLimiter,
  validateRegister,
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await AuthService.register(req.body, req);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

// Login
router.post(
  "/login",
  authLimiter,
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      await AuthService.login(email, password, req, res);
    } catch (error) {
      res.status(401).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

// Logout
router.post("/logout", authenticate, async (req, res) => {
  try {
    await AuthService.logout(req, res);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Logout all devices
router.post("/logout-all", authenticate, async (req, res) => {
  try {
    await AuthService.logoutAll(req.user._id, res);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// EMAIL VERIFICATION ROUTES

// Verify email
router.get(
  "/verify-email/:token",
  emailVerificationLimiter,
  async (req, res) => {
    try {
      const result = await AuthService.verifyEmail(req.params.token);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

// Resend verification email
router.post(
  "/resend-verification",
  authenticate,
  emailVerificationLimiter,
  async (req, res) => {
    try {
      if (req.user.isEmailVerified) {
        return res.status(400).json({
          status: "error",
          message: "Email is already verified",
        });
      }

      const result = await AuthService.register(
        {
          email: req.user.email,
          username: req.user.username,
          password: "dummy", // Won't be used as user already exists
          role: req.user.role,
        },
        req
      );

      res.status(200).json({
        status: "success",
        message: "Verification email sent successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to send verification email",
      });
    }
  }
);

// PASSWORD RESET ROUTES

// Forgot password
router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const result = await AuthService.forgotPassword(email, req);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

// Reset password
router.patch(
  "/reset-password/:token",
  validatePasswordReset,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { password } = req.body;
      const result = await AuthService.resetPassword(
        req.params.token,
        password,
        req
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

// Get users (Admin only)
router.get("/users", authenticate, restrictTo("admin"), async (req, res) => {
  try {
    const User = require("../models/user");
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "_id username email role createdAt updatedAt lastLogin isActive isEmailVerified"
    );

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get user profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = { ...req.user.toObject() };
    delete user.password;
    delete user.refreshTokens;
    delete user.twoFactorSecret;
    delete user.passwordResetToken;
    delete user.emailVerificationToken;

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch profile",
    });
  }
});

// Update user profile
router.patch("/profile", authenticate, async (req, res) => {
  try {
    const { username } = req.body;
    const User = require("../models/user");

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (
        existingUser &&
        existingUser._id.toString() !== req.user._id.toString()
      ) {
        return res.status(400).json({
          status: "error",
          message: "Username already taken",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update profile",
    });
  }
});

// Change password
router.patch("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const User = require("../models/user");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    user.refreshTokens = []; // Clear all refresh tokens
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to change password",
    });
  }
});

// Delete user (Admin only)
router.delete(
  "/users/:id",
  authenticate,
  restrictTo("admin"),
  async (req, res) => {
    try {
      const User = require("../models/user");
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user._id.toString()) {
        return res.status(400).json({
          status: "error",
          message: "You cannot delete your own account",
        });
      }

      await User.findByIdAndDelete(id);

      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }
);

// Get login history
router.get("/login-history", authenticate, async (req, res) => {
  try {
    const user = await req.user.populate("loginHistory");

    res.status(200).json({
      status: "success",
      data: {
        loginHistory: user.loginHistory,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch login history",
    });
  }
});

// Get active sessions
router.get("/sessions", authenticate, async (req, res) => {
  try {
    const sessions = req.user.refreshTokens.map((token) => ({
      deviceInfo: token.deviceInfo,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    }));

    res.status(200).json({
      status: "success",
      data: {
        sessions,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sessions",
    });
  }
});

// Refresh token
router.post("/refresh-token", async (req, res) => {
  try {
    await AuthService.refreshToken(req, res);
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = router;
