const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../models/user");
const emailService = require("./emailService");
const logger = require("../utils/logger");

class AuthService {
  // Generate JWT tokens
  static signToken(id, type = "access") {
    const expiresIn = type === "refresh" ? "7d" : "1d";
    return jwt.sign({ id, type }, process.env.JWT_SECRET, {
      expiresIn,
    });
  }

  // Create and send tokens
  static async createSendTokens(user, statusCode, res, deviceInfo = "") {
    const accessToken = this.signToken(user._id);
    const refreshToken = this.signToken(user._id, "refresh");

    // Add refresh token to user's refreshTokens array
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt,
      deviceInfo,
    });

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Remove 2FA secrets from user object
    const userCopy = user.toObject();
    delete userCopy.password;
    delete userCopy.refreshTokens;
    delete userCopy.emailVerificationToken;
    delete userCopy.emailVerificationExpires;
    delete userCopy.passwordResetToken;
    delete userCopy.passwordResetExpires;
    delete userCopy.loginAttempts;
    delete userCopy.lockUntil;

    await user.save({ validateBeforeSave: false });

    res.status(statusCode).json({
      status: "success",
      accessToken,
      data: {
        user: userCopy,
      },
    });
  }

  // Log login attempts
  static async logLoginAttempt(user, req, success) {
    const loginEntry = {
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      success,
    };

    user.loginHistory.push(loginEntry);

    // Keep only last 10 login attempts
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    await user.save({ validateBeforeSave: false });
  }

  // Register user
  static async register(userData, req) {
    try {
      const { username, email, password, role } = userData;

      // 1) Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // 2) Create user
      const newUser = await User.create({
        username,
        email,
        password,
        role: role || "user",
      });

      // 3) Generate email verification token
      const verifyToken = crypto.randomBytes(32).toString("hex");
      newUser.emailVerificationToken = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");
      newUser.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await newUser.save({ validateBeforeSave: false });

      // 4) Send verification email
      await emailService.sendWelcomeEmail(email, username, verifyToken);

      // 5) Log successful registration
      logger.info("User registered successfully", {
        userId: newUser._id,
        email: newUser.email,
        username: newUser.username,
        ip: req.ip,
      });

      return {
        status: "success",
        message:
          "Registration successful! Please check your email to verify your account.",
      };
    } catch (error) {
      logger.error("Registration failed", {
        error: error.message,
        email: userData.email,
        ip: req.ip,
      });
      throw error;
    }
  }

  // Login user
  static async login(email, password, req, res) {
    try {
      // 1) Check if email and password exist
      if (!email || !password) {
        throw new Error("Please provide email and password");
      }

      // 2) Check if user exists and password is correct
      const user = await User.findOne({ email }).select(
        "+password +loginAttempts +lockUntil"
      );

      // 3) Check if account is locked
      if (user && user.isLocked) {
        throw new Error(
          "Account temporarily locked due to too many failed login attempts"
        );
      }

      // 4) Check if account is active
      if (!user || !user.isActive) {
        throw new Error(
          "Account is deactivated. Please contact administrator."
        );
      }

      // 5) Check password
      const isPasswordCorrect = await user.correctPassword(
        password,
        user.password
      );

      if (!isPasswordCorrect) {
        // Log failed attempt
        await user.incLoginAttempts();
        await this.logLoginAttempt(user, req, false);

        logger.warn("Failed login attempt", {
          email,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        });

        throw new Error("Invalid email or password");
      }

      // 6) Reset login attempts and update login info
      await user.resetLoginAttempts();
      user.lastLogin = Date.now();
      user.lastActiveAt = Date.now();
      await user.save({ validateBeforeSave: false });

      // 7) Log successful login
      await this.logLoginAttempt(user, req, true);

      logger.info("Successful login", {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });

      // 8) Create and send tokens
      const deviceInfo = `${req.get("User-Agent")} - ${req.ip}`;
      await this.createSendTokens(user, 200, res, deviceInfo);
    } catch (error) {
      logger.error("Login failed", {
        error: error.message,
        email,
        ip: req.ip,
      });
      throw error;
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          status: "error",
          message: "No refresh token found",
        });
      }

      // Find user by refresh token and remove it
      const user = await User.findOneAndUpdate(
        {
          "refreshTokens.token": refreshToken,
        },
        {
          $pull: { refreshTokens: { token: refreshToken } },
          $set: { lastActiveAt: Date.now() },
        },
        { new: true }
      );

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Invalid refresh token",
        });
      }

      // Clear the refresh token cookie
      res.clearCookie("refreshToken");

      logger.info("User logged out successfully", {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });

      res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    } catch (error) {
      logger.error("Logout failed", {
        error: error.message,
        ip: req.ip,
      });
      throw error;
    }
  }

  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          status: "error",
          message: "No refresh token found",
        });
      }

      // 1) Verify refresh token
      const decoded = await promisify(jwt.verify)(
        refreshToken,
        process.env.JWT_SECRET
      );

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      // 2) Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error("User no longer exists");
      }

      // 3) Check if user is active
      if (!user.isActive) {
        throw new Error("User account is deactivated");
      }

      // 4) Check if refresh token exists in database
      const tokenExists = user.refreshTokens.some(
        (rt) => rt.token === refreshToken && rt.expiresAt > new Date()
      );

      if (!tokenExists) {
        throw new Error("Invalid or expired refresh token");
      }

      // 5) Check if user changed password after the token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        throw new Error("User recently changed password. Please log in again.");
      }

      // 6) Generate new access token
      const newAccessToken = this.signToken(user._id);

      // Update last active
      user.lastActiveAt = Date.now();
      await user.save({ validateBeforeSave: false });

      res.status(200).json({
        status: "success",
        accessToken: newAccessToken,
      });
    } catch (error) {
      logger.error("Token refresh failed", {
        error: error.message,
        ip: req.ip,
      });
      throw error;
    }
  }

  // Email verification
  static async verifyEmail(token) {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error("Token is invalid or has expired");
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return {
        status: "success",
        message: "Email verified successfully",
      };
    } catch (error) {
      logger.error("Email verification failed", {
        error: error.message,
        token,
      });
      throw error;
    }
  }

  // Forgot password
  static async forgotPassword(email, req) {
    try {
      // 1) Get user based on POSTed email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("There is no user with that email address");
      }

      // 2) Generate the random reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save({ validateBeforeSave: false });

      // 3) Send it to user's email
      await emailService.sendPasswordResetEmail(email, resetToken);

      logger.info("Password reset token sent", {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });

      return {
        status: "success",
        message: "Token sent to email!",
      };
    } catch (error) {
      logger.error("Password reset request failed", {
        error: error.message,
        email,
        ip: req.ip,
      });
      throw error;
    }
  }

  // Reset password
  static async resetPassword(token, password, req) {
    try {
      // Hash token and find user
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error("Token is invalid or has expired");
      }

      // Set new password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      // Clear all refresh tokens
      user.refreshTokens = [];

      await user.save();

      logger.info("Password reset successful", {
        userId: user._id,
        email: user.email,
        ip: req.ip,
      });

      return {
        status: "success",
        message: "Password reset successful",
      };
    } catch (error) {
      logger.error("Password reset failed", {
        error: error.message,
        ip: req.ip,
      });
      throw error;
    }
  }

  // Logout from all devices
  static async logoutAll(userId, res) {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] },
      });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(200).json({
        status: "success",
        message: "Logged out from all devices successfully",
      });
    } catch (error) {
      logger.error("Logout all failed", {
        error: error.message,
        userId,
      });
      throw error;
    }
  }
}

module.exports = AuthService;
