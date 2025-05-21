const express = require("express");
const router = express.Router();
const invoiceModel = require("../models/invoiceModel");
const itemModel = require("../models/item");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
// const  generateQRCode = require("../qr.js");
require("dotenv").config();

async function generateQRCode(invoiceId) {
  const url = await QRCode.toDataURL(
    `${process.env.VITE_FRONTEND_URL}/invoice/${invoiceId}`,
    { width: 64 }
  );
  return url;
}

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceData = req.body;
    console.log(invoiceData, "invoiceData");
    // const url = await QRCode.toDataURL(
    //   `${process.env.VITE_FRONTEND_URL}/invoice/${newInvoice._id}`,
    //   { width: 64 }
    // );
    const url = await generateQRCode(invoiceData._id);
    invoiceData.qrCode = url;
    console.log(url, "url");

    // Update quantities for all items in the invoice
    for (const invoiceItem of invoiceData.items) {
      const item = await itemModel.findById(invoiceItem.id);
      if (!item) {
        throw new Error(`Item not found: ${invoiceItem.name}`);
      }
      if (item.quantity < invoiceItem.quantity) {
        throw new Error(`Insufficient quantity for item: ${invoiceItem.name}`);
      }
      await itemModel.findByIdAndUpdate(
        invoiceItem.id,
        {
          $inc: { quantity: -invoiceItem.quantity },
          $set: { updatedAt: new Date() },
        },
        { session }
      );
    }

    // Create and save the invoice first (without QR code)
    const newInvoice = new invoiceModel(invoiceData);
    await newInvoice.save({ session });

    // Now generate the QR code using the saved invoice's ID

    await newInvoice.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res.status(201).json({
      message: "Invoice saved successfully and quantities updated",
      invoice: newInvoice,
      url: url,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: "Error saving invoice",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

router.get("/get-invoice-number", async (req, res) => {
  const lastInvoice = await invoiceModel.find();

  if (lastInvoice.length === 0) {
    const currentYear = new Date().getFullYear().toString().slice(2);
    const nextYear = Number(currentYear) + 1;
    const nextInvoiceNumber = `DE/1/${currentYear}-${nextYear}`;
    return res.json({ invoiceNumber: nextInvoiceNumber });
  }
  const lastInvoiceNumber = lastInvoice[lastInvoice.length - 1].invoiceNumber;
  const lastInvoiceParts = lastInvoiceNumber.split("/");
  const lastInvoiceYear = lastInvoiceParts[1];
  const currentYear = new Date().getFullYear().toString().slice(2); // 25
  const nextYear = Number(currentYear) + 1;
  const nextInvoiceNumber = `DE/${
    Number(lastInvoiceYear) + 1
  }/${currentYear}-${nextYear}`;
  res.json({ invoiceNumber: nextInvoiceNumber });
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const invoice = await invoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (err) {
    console.log(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const invoices = await invoiceModel
      .find()
      .select({
        __v: 0,
        "items._id": 0,
        "items.__v": 0,
        "items.category.__v": 0,
        "items.category._id": 0,
      })
      .populate("items.category");

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoices", error });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Find the invoice by ID
    const invoice = await invoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    // Update quantities for all items in the invoice
    for (const invoiceItem of invoice.items) {
      const item = await itemModel.findById(invoiceItem.id);
      if (!item) {
        throw new Error(`Item not found: ${invoiceItem.name}`);
      }
      await itemModel.findByIdAndUpdate(
        invoiceItem.id,
        {
          $inc: { quantity: invoiceItem.quantity },
          $set: { updatedAt: new Date() },
        }
      );
    }
    // Delete the invoice
    await invoiceModel.findByIdAndDelete(id);
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Error deleting invoice", error });
  }
});

module.exports = router;
