const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173", // Your frontend URL (Vite default port)
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//   })
// );

app.use(cors())
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

app.use("/category", categoryRoute);
app.use("/item", itemRoute);
app.use("/invoice", invoiceRoute);
app.use("/customer", customerRoute);

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
