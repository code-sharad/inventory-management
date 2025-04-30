const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Category name is required"],
        unique:true,
        trim:true,
        lowercase: true, 
        minlength: [1, "Category name must be at least 1 character"]
    }
})

categorySchema.index({ name: 1 }, { unique: true });

const categoryModel = mongoose.model("categoryModel" , categorySchema)

module.exports = categoryModel