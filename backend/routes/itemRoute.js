const express = require("express");
const router = express.Router();

const itemSchema = require("../models/item");

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const newItem = new itemSchema(data);
    const response = await newItem.save();
    res.status(200).json(response);
    console.log("Data saved Successfully");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  // try{
  //     const item = await itemSchema.find().populate('category')
  //     res.status(200).json(item)
  //     console.log("data fetched Successfully!!!")
  // }
  // catch(e){
  //     res.status(500).json({ message: e.message })
  // }

  try {
    const item = await itemSchema
      .find({})
      .select({
        __v: 0,
      })
      .populate("category", "name");
    console.log(
      "Fetched items with populated categories:",
      JSON.stringify(item, null, 2)
    );
    res.status(200).json(item);
    console.log("Data fetched Successfully!!!");
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const updateItem = req.body;

    const response = await itemSchema.findByIdAndUpdate(itemId, updateItem, {
      new: true,
      runValidators: true,
    });

    if (!response) {
      return res.status(404).json({ error: "Person not found" });
    }

    console.log("Data updated successfully!!!");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleteItem = await itemSchema.findByIdAndDelete(req.params.id);
    res.json({ message: "Item Deleted Successfully!!!" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
