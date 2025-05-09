const mongoose = require("mongoose");

const invoiceSchema = mongoose.Schema({
  customer: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  packaging: {
    type: Number,
    required: true,
  },
  transportationAndOthers: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  gstAmount:{
    type: Number,
    required:true
  },
  gstRate:{
    type: Number,
    required:true
  },
  total: {
    type: Number,
    required: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  template: {
    type: String,
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceDate: {
    type: String,
    required: true,
  },
  items: [
    {
      id: String,
      name: String,
      quantity: Number,
      price: Number,
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categoryModel",
      },
    },
  ],
  companyDetails: {
    name: String,
    address: String,
    cityState: String,
    phone: String,
    email: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const invoiceModel = mongoose.model("invoiceModel", invoiceSchema);

module.exports = invoiceModel;
