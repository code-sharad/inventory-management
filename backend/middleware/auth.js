const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/user");
const logger = require("../utils/logger");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Enhanced authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // 1) Get token from cookies or Authorization header
    let token;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "You are not logged in! Please log in to get access.",
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

    // 3) Check if token is access token
    if (decoded.type !== "access") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token type",
      });
    }

    // 4) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "error",
        message: "The user belonging to this token does no longer exist.",
      });
    }

    // 5) Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        status: "error",
        message:
          "Your account has been deactivated. Please contact administrator.",
      });
    }

    // 6) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "error",
        message: "User recently changed password! Please log in again.",
      });
    }

    // 7) Update last active time
    currentUser.lastActiveAt = Date.now();
    await currentUser.save({ validateBeforeSave: false });

    // 8) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error("Authentication failed", {
      error: error.message,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token. Please log in again!",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Your token has expired! Please log in again.",
      });
    }

    return res.status(401).json({
      status: "error",
      message: "Authentication failed",
    });
  }
};

// Enhanced role-based access control
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user role is included in allowed roles
    if (!roles.includes(req.user.role)) {
      logger.warn("Unauthorized access attempt", {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        path: req.path,
      });

      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

// Middleware to check if user is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      status: "error",
      message: "Please verify your email address to access this resource",
    });
  }
  next();
};

// Optional authentication - doesn't require login but populates user if logged in
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

        if (decoded.type === "access") {
          const currentUser = await User.findById(decoded.id);

          if (
            currentUser &&
            currentUser.isActive &&
            !currentUser.changedPasswordAfter(decoded.iat)
          ) {
            req.user = currentUser;

            // Update last active time
            currentUser.lastActiveAt = Date.now();
            await currentUser.save({ validateBeforeSave: false });
          }
        }
      } catch (error) {
        // Token invalid or expired - continue without user
        logger.debug("Optional auth failed", {
          error: error.message,
          ip: req.ip,
        });
      }
    }

    next();
  } catch (error) {
    logger.error("Optional auth middleware error", {
      error: error.message,
      ip: req.ip,
    });
    next();
  }
};

// Legacy function for backward compatibility
function getTokenFromCookies(req) {
  return req.cookies && req.cookies.token ? req.cookies.token : null;
}

module.exports = {
  authenticate,
  restrictTo,
  requireEmailVerification,
  optionalAuth,
  getTokenFromCookies, // Keep for backward compatibility
};
