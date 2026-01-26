import mongoose from "mongoose"
import { lowercase } from "zod"

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trime: true,
    },
    deleteAt: {
        type: Date,
        default: null,
        index: true
    },

}, {timestamps: true})


const CategoryModel = mongoose.models.Category || mongoose.model('Category', 
categorySchema, 'categories')
export default CategoryModel

