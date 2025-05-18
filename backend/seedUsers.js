const mongoose = require("mongoose")
const bcrypt = require("bcryptjs");
const User = require("./models/user");
require("dotenv").config();

const mongoURL = process.env.MONGOURL_VARUN;
const seedUsers = async () => {
  try {
    console.log(mongoURL)
    await mongoose.connect(mongoURL);



    // Hardcoded users
    const users = [
      {
        username: "Varun",
        email: "kalevarun54@gmail.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
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

seedUsers().then(() => {
  console.log('connected')
})
