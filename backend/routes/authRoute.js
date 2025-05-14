require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { restrictTo, authenticate } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;

function isStrongPassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   //   console.log("Received login request:", { username });

//   try {
//     if (!email || !password) {
//       console.log("Missing fields in request:", { email, password });
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("User not found:", email);
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     user.lastLogin = Date.now();
//     await user.save();

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       console.log("Password mismatch for user:", email);
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     // if (user.role !== "admin") {
//     //   console.log("Role mismatch:", { expected: user.role, received: "admin" });
//     //   return res.status(403).json({ message: `Role must be admin` });
//     // }

//     const token = jwt.sign(
//       { userId: user._id, email: user.email, role: user.role },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );
//     res.header("Authorization", `Bearer ${token}`);
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV !== "development",
//       maxAge: 3600000, // 1 hour
//       sameSite: "none",
//     });
//     console.log("Login successful for user:", email);
//     res
//       .status(200)
//       .json({ token, user: { email: user.email, role: user.role } });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

router.post("/logout", (req, res) => {
  res.header("Authorization", "");
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 0,
  });
  res.status(200).json({ message: "Logout successful" });
});

router.post(
  "/create-user",
  authenticate,
  restrictTo(["admin"]),
  async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password is too weak." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
    res.status(200).json({ message: "User created successfully" });
  }
);

router.post(
  "/change-admin-email",
  authenticate,
  restrictTo(["admin"]),
  async (req, res) => {
    const { email, newEmail } = req.body;
    const user = await User.findOneAndUpdate({ email }, { email: newEmail });
    res.status(200).json({ message: "Email changed successfully" });
  }
);

router.post(
  "/change-admin-password",
  authenticate,
  restrictTo(["admin"]),
  async (req, res) => {
    const { email, newPassword } = req.body;
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "Password is too weak." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );
    res.status(200).json({ message: "Password changed successfully" });
  }
);

router.post("/change-user-password", authenticate, async (req, res) => {
  const { email, newPassword } = req.body;
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ message: "Password is too weak." });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { password: hashedPassword }
  );
  res.status(200).json({ message: "Password changed successfully" });
});

// Get all users (admin only)
router.get("/users", restrictTo("admin"), async (req, res) => {
  try {
    const users = await User.find(
      {},
      "_id username email role createdAt updatedAt lastLogin"
    );
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

// Delete user by id (admin only)
router.delete("/delete-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
});

module.exports = router;
