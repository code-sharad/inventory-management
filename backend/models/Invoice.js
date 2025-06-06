const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoice_number: { type: String, required: true },
  invoice_date: { type: Date, required: true },
  challan_no: { type: String },
  challan_date: { type: Date },
  po_no: { type: String },
  eway_no: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', InvoiceSchema); 