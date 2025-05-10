const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
require("dotenv").config();

const mongoURL = process.env.MONGOURL;
const seedUsers = async () => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing users
    await User.deleteMany({});

    // Hardcoded users
    const users = [
      {
        username: "admin",
        email: "admin@gmail.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      },
      {
        username: "user",
        email: "user@gmail.com",
        password: await bcrypt.hash("user123", 10),
        role: "user",
      },
    ];

    // Insert users
    await User.insertMany(users);
    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();
