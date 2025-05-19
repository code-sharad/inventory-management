const express = require("express");
const router = express.Router();
const invoiceModel = require("../models/invoiceModel");
const itemModel = require("../models/item");
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceData = req.body;
    console.log(invoiceData);
    // Update quantities for all items in the invoice
    for (const invoiceItem of invoiceData.items) {
      const item = await itemModel.findById(invoiceItem.id);
      // item.category = invoiceItem.categoryId;
      // console.log(item);
      if (!item) {
        throw new Error(`Item not found: ${invoiceItem.name}`);
      }

      if (item.quantity < invoiceItem.quantity) {
        throw new Error(`Insufficient quantity for item: ${invoiceItem.name}`);
      }

      // Decrement the quantity
      await itemModel.findByIdAndUpdate(
        invoiceItem.id,
        {
          $inc: { quantity: -invoiceItem.quantity },
          $set: {
            updatedAt: new Date(),
          },
        },
        { session }
      );
    }
    // const totalInvoices = await invoiceModel.find({});
    // const lastInvoice = totalInvoices[totalInvoices.length - 1];
    // const lastInvoiceNumber = lastInvoice.invoiceNumber;
    // const lastInvoiceNumberParts = lastInvoiceNumber.split("-");
    // const lastInvoiceNumberYear = lastInvoiceNumberParts[1];
    // console.log(lastInvoiceNumberYear);
    // const currentYear = new Date().getFullYear();
    // const invoiceNumber = `DE-${Number(lastInvoiceNumberYear) + 1}-${currentYear}`;

    // // Create and save the invoice
    // invoiceData.invoiceNumber = invoiceNumber;
    const newInvoice = new invoiceModel(invoiceData);
    await newInvoice.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res.status(201).json({
      message: "Invoice saved successfully and quantities updated",
      invoice: newInvoice,
    });
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    res.status(500).json({
      message: "Error saving invoice",
      error: error.message,
    });
  } finally {
    // End the session
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
  const lastInvoiceParts = lastInvoiceNumber.split("-");
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
    await invoiceModel.findByIdAndDelete(id);
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting invoice", error });
  }
});

module.exports = router;
