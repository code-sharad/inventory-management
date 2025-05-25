const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("MongoDB connected for migration");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Migration function to remove loginAttempts and lockUntil fields
const removeLoginAttemptsFields = async () => {
  try {
    console.log(
      "Starting migration to remove loginAttempts and lockUntil fields..."
    );

    // Remove the fields from all user documents
    const result = await mongoose.connection.db.collection("users").updateMany(
      {},
      {
        $unset: {
          loginAttempts: "",
          lockUntil: "",
        },
      }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Modified ${result.modifiedCount} user documents`);
    console.log(`Matched ${result.matchedCount} user documents`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Run migration
const runMigration = async () => {
  try {
    await connectDB();
    await removeLoginAttemptsFields();
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Execute migration if this file is run directly
if (require.main === module) {
  runMigration();
}

module.exports = { removeLoginAttemptsFields };
