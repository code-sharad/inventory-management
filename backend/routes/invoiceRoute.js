const express = require('express');
const router = express.Router();
const invoiceModel = require('../models/invoiceModel');
const itemModel = require("../models/item");
const mongoose = require('mongoose');


router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceData = req.body;

    // Update quantities for all items in the invoice
    for (const invoiceItem of invoiceData.items) {
      const item = await itemModel.findById(invoiceItem.id);

      if (!item) {
        throw new Error(`Item not found: ${invoiceItem.name}`);
      }

      if (item.quantity < invoiceItem.quantity) {
        throw new Error(`Insufficient quantity for item: ${invoiceItem.name}`);
      }

      // Decrement the quantity
      await itemModel.findByIdAndUpdate(
        invoiceItem.id,
        { $inc: { quantity: -invoiceItem.quantity } },
        { session }
      );
    }

    // Create and save the invoice
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

router.get('/', async (req, res) => {
  try {
    const invoices = await invoiceModel
      .find()
      .select({
      __v: 0,
      "items._id": 0,
      "items.__v": 0,
      "items.category.__v": 0,
      "items.category._id": 0
      })
      .populate("items.category");
    

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await invoiceModel.findByIdAndDelete(id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error });
  }
});

module.exports = router;