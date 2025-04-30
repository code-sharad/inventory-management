const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.MONGOURL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

async function dbConnect() {
  try {
    await mongoose.connect(mongoURL);
    // console.log(`succesfully connected to db`)
    return "succesfully connected to db";
  } catch (error) {
    console.log(error);
    process.abort(1);
  }
}

// db.on("connected", () => {
//   console.log("Database connected successfully!!");
// });

// db.on("error", (err) => {
//   console.log("Error occured because of ", err);
// });

// db.on("disconnected", () => {
//   console.log("Database connection has disconnected");
// });

module.exports = dbConnect;
