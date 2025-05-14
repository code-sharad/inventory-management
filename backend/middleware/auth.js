const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  try {
    const token = getTokenFromCookies(req);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const restrictTo = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

function getTokenFromCookies(req) {
  return req.cookies && req.cookies.token ? req.cookies.token : null;
}

module.exports = { authenticate, restrictTo };
