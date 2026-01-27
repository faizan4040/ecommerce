import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    category:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Category',
       required: true
    },

    mrp: {
        type: Number,
        required: true,
    },

    sellingPrice: {
        type: Number,
        required: true,
    },

    discountPercentage: {
        type: Number,
        required: true,
    },

    stock: {
        type: Number,
        default: 0,
        min: 0,
    },

    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock'],
        default: 'active',
        index: true,
    },

    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            required: true
        },
    ],

    discription: {
        type: String,
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, {timestamps: true})


productSchema.index({ category: 1 })
const ProductModel = mongoose.models.Product || mongoose.model('Product', 
productSchema, 'products')
export default ProductModel

