const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "customer name is required"],
    trim: true,
    lowercase: true,
    minlenght: [1, "Customer name must be at least 1 character"],
  },
  gstNumber: {
    type: String,
    unique: true,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  panNumber: {
    type: String,
    required: true,
    unique: true,
  },
});

customerSchema.index({ gstNumber: 1 }, { unique: true });
const customerModel = mongoose.model("Customer", customerSchema);

module.exports = customerModel;
