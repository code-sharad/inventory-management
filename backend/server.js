const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoute");
const { authenticate, restrictTo } = require("./middleware/auth");

const rateLimit = require("express-rate-limit");

require("dotenv").config();
const app = express();
app.set("trust proxy", 1);

// app.use(
//   cors({
//     origin: "http://localhost:5173", // Your frontend URL (Vite default port)
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//   })
// );
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const csurf = require("csurf");
const JWT_SECRET = process.env.JWT_SECRET;

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(bodyParser.json());

app.use(
  cors({
    origin: process.env.VITE_FRONTEND_URL,
    credentials: true,
  })
);
app.use(
  csurf({
    cookie: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    },
  })
);

const db = require("./db");
db().then((res) => {
  console.log(res);
});

app.get("/", (req, res) => {
  res.send("backend is live");
});

const categoryRoute = require("./routes/categoryRoute");
const itemRoute = require("./routes/itemRoute");
const invoiceRoute = require("./routes/invoiceRoute");
const customerRoute = require("./routes/customerRoute");
const User = require("./models/user");
const invoiceModel = require("./models/invoiceModel");

app.use("/auth", authenticate, authRoutes);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many login attempts, please try again later.",
});

app.use("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  //   console.log("Received login request:", { username });

  try {
    if (!email || !password) {
      console.log("Missing fields in request:", { email, password });
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(404).json({ message: "Invalid username or password" });
    }
    user.lastLogin = Date.now();
    await user.save();
    // if (user.role !== "admin") {
    //   console.log("Role mismatch:", { expected: user.role, received: "admin" });
    //   return res.status(403).json({ message: `Role must be admin` });
    // }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log(token);

    res.header("Authorization", `Bearer ${token}`);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000 * 24, // 1 day
      sameSite: "none",
    });
    console.log("Login successful for user:", email);
    res.status(200).json({
      token,
      user: { email: user.email, role: user.role, _id: user._id },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/csrf-token", (req, res) => {
  console.log(req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/customer", authenticate, customerRoute);
app.use("/category", authenticate, categoryRoute);
app.use("/item", authenticate, itemRoute);
app.use("/invoice", authenticate, invoiceRoute);
app.use("/invoice-view/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const invoice = await invoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
