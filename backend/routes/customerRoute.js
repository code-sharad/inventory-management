const express = require("express");
const customerModel = require("../models/customer");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let { name, email, address } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ error: "fields is required" });
    }

    name = name.trim().toLowerCase();

    const existingCustomer = await customerModel.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ error: "Customer already exists" });
    }

    const customer = new customerModel({ name, email, address });
    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    // console.log(e)
    // res.status(500).json({error:"Internal server error"})

    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({ error: "Customer already exists" });
    }
    console.error("Error in POST /customer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const data = await customerModel.find({});
    res.status(200).json(data);
  } catch (error) {
    console.log("Error in GET /customer", error);
    res.status(500).json({ message: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const dbRes = await customerModel.deleteOne({ _id: id });
    res.status(200).json({ dbRes, message: "Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
