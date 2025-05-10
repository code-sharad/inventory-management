const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoute");
const { authenticate, restrictTo } = require("./middleware/auth");

const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173", // Your frontend URL (Vite default port)
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//   })
// );

app.use(
  cors({
    origin: process.env.VITE_FRONTEND_URL,
    credentials: true,
  })
);

app.use(bodyParser.json());

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

app.use("/auth", authRoutes);
app.use("/category", authenticate, categoryRoute);
app.use("/item", authenticate, itemRoute);
app.use("/invoice", authenticate, invoiceRoute);
app.use("/customer", authenticate, customerRoute);

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
