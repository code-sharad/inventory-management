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
router.post("/logout-all", authenticate, restrictTo("admin"), async (req, res) => {
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
    const users = await User.find({}).select(
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

// Create user (Admin only)
router.post(
  "/create-user",
  authenticate,
  restrictTo("admin"),
  validateRegister,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      const User = require("../models/user");

      // 1) Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "User already exists with this email",
        });
      }

      // 2) Create user (admin-created users are automatically verified)
      const newUser = await User.create({
        username,
        email,
        password,
        role: role || "user",
        isEmailVerified: true, // Admin-created users are pre-verified
        isActive: true,
      });

      // 3) Log successful user creation
      logger.info("User created by admin", {
        createdUserId: newUser._id,
        createdUserEmail: newUser.email,
        createdUserUsername: newUser.username,
        createdUserRole: newUser.role,
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

      // 4) Return success response
      res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: {
          user: {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            isActive: newUser.isActive,
            isEmailVerified: newUser.isEmailVerified,
            createdAt: newUser.createdAt,
          },
        },
      });
    } catch (error) {
      logger.error("Admin user creation failed", {
        error: error.message,
        email: req.body.email,
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

// Change admin password
router.post(
  "/change-admin-password",
  authenticate,
  restrictTo("admin"),
  [
    body("current").notEmpty().withMessage("Current password is required"),
    body("new")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
    body("confirm").custom((value, { req }) => {
      if (value !== req.body.new) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { current, new: newPassword } = req.body;
      const User = require("../models/user");

      // Get admin user with password
      const admin = await User.findById(req.user._id).select("+password");

      // Check current password
      const isCurrentPasswordCorrect = await admin.correctPassword(
        current,
        admin.password
      );
      if (!isCurrentPasswordCorrect) {
        return res.status(401).json({
          status: "error",
          message: "Current password is incorrect",
        });
      }

      // Update password
      admin.password = newPassword;
      admin.refreshTokens = []; // Clear all refresh tokens
      await admin.save();

      logger.info("Admin password changed", {
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

      res.status(200).json({
        status: "success",
        message: "Admin password changed successfully",
      });
    } catch (error) {
      logger.error("Admin password change failed", {
        error: error.message,
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

      res.status(500).json({
        status: "error",
        message: "Failed to change admin password",
      });
    }
  }
);

// Change admin email
router.post(
  "/change-admin-email",
  authenticate,
  restrictTo("admin"),
  [
    body("newEmail")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("confirmEmail").custom((value, { req }) => {
      if (value !== req.body.newEmail) {
        throw new Error("Email addresses do not match");
      }
      return true;
    }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { newEmail } = req.body;
      const User = require("../models/user");

      // Check if email is already taken
      const existingUser = await User.findOne({ email: newEmail });
      if (
        existingUser &&
        existingUser._id.toString() !== req.user._id.toString()
      ) {
        return res.status(400).json({
          status: "error",
          message: "Email address is already in use",
        });
      }

      // Update email
      const admin = await User.findByIdAndUpdate(
        req.user._id,
        {
          email: newEmail,
          isEmailVerified: true, // Admin can verify their own email
        },
        { new: true, runValidators: true }
      );

      logger.info("Admin email changed", {
        adminId: req.user._id,
        oldEmail: req.user.email,
        newEmail: newEmail,
        ip: req.ip,
      });

      res.status(200).json({
        status: "success",
        message: "Admin email changed successfully",
        data: {
          user: {
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          },
        },
      });
    } catch (error) {
      logger.error("Admin email change failed", {
        error: error.message,
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

      res.status(500).json({
        status: "error",
        message: "Failed to change admin email",
      });
    }
  }
);

// Change user password (Admin only)
router.post(
  "/change-user-password",
  authenticate,
  restrictTo("admin"),
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      const User = require("../models/user");

      // 1) Find the user by email
      const targetUser = await User.findOne({ email }).select("+password");
      if (!targetUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found with this email address",
        });
      }

      // 2) Prevent admin from changing another admin's password (unless it's their own)
      if (
        targetUser.role === "admin" &&
        targetUser._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          status: "error",
          message: "Cannot change another admin's password",
        });
      }

      // 3) Update the user's password
      targetUser.password = newPassword;
      targetUser.refreshTokens = []; // Clear all refresh tokens to force re-login
      await targetUser.save();

      // 4) Log the password change
      logger.info("User password changed by admin", {
        targetUserId: targetUser._id,
        targetUserEmail: targetUser.email,
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

      // 5) Return success response
      res.status(200).json({
        status: "success",
        message: "User password changed successfully",
      });
    } catch (error) {
      logger.error("Admin password change failed", {
        error: error.message,
        email: req.body.email,
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

      res.status(500).json({
        status: "error",
        message: "Failed to change user password",
      });
    }
  }
);

// Delete user (Admin only) - frontend compatible route
router.delete(
  "/delete-user/:id",
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

      // Find and delete the user
      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Prevent deleting another admin (unless it's their own account)
      if (
        userToDelete.role === "admin" &&
        userToDelete._id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          status: "error",
          message: "Cannot delete another admin account",
        });
      }

      await User.findByIdAndDelete(id);

      logger.info("User deleted by admin", {
        deletedUserId: userToDelete._id,
        deletedUserEmail: userToDelete.email,
        deletedUserUsername: userToDelete.username,
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      logger.error("Admin user deletion failed", {
        error: error.message,
        userId: req.params.id,
        adminId: req.user._id,
        adminEmail: req.user.email,
        ip: req.ip,
      });

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
