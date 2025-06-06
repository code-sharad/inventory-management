const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURL);
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function to update Invoice documents
const updateInvoiceFields = async () => {
  try {
    console.log('Starting migration to update Invoice fields...');

    // Update the fields in all Invoice documents
    const result = await mongoose.connection.db.collection('invoicemodels').updateMany(
      {},
      {
        $set: {
          // invoice_number: 'DE/36/25-26',
          // invoice_date: new Date('2025-06-06'),
          challan_no: '8239',
          challan_date: new Date('2025-06-25'),
          po_no: '8932',
          eway_no: 'najsdf93289',
        },
      }
    );

    console.log('Migration completed successfully!');
    console.log(`Modified ${result.modifiedCount} invoice documents`);
    console.log(`Matched ${result.matchedCount} invoice documents`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Run migration
const runMigration = async () => {
  try {
    await connectDB();
    await updateInvoiceFields();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Execute migration if this file is run directly
if (require.main === module) {
  runMigration();
}

module.exports = { updateInvoiceFields }; 