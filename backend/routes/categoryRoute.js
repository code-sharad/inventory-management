const express = require("express")
const router = express.Router()

const categorySchema = require("../models/category")


router.post("/" , async (req , res) => {
    try{
        let { name } = req.body;

        if (!name || name.trim() === "") { 
            return res.status(400).json({ error: "Category name is required" });
        }

        name = name.trim().toLowerCase();

        const existingCategory = await categorySchema.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }

        const category = new categorySchema({ name });
        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    }
    catch(error){
        // console.log(e)
        // res.status(500).json({error:"Internal server error"})

        if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(400).json({ error: "Category already exists" });
        }
        console.error("Error in POST /category:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})


router.get('/' , async (req , res) => {
    try{
        const response = await categorySchema.find()
        res.status(200).json(response)
    }
    catch(e){
        res.status(500).json({error:"internal server error"})
    }
})


router.delete("/:id", async (req, res) => {
    try {
        const categoryId = req.params.id
        await categorySchema.findByIdAndDelete(categoryId)
        res.json({ message: "Category deleted successfully" })
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})


module.exports = router