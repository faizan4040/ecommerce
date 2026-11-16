import mongoose from "mongoose"
import "./Media.model" 

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

    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            required: true
        },
    ],

    description: {
        type: String,
        required: true
    },

    brand: {
        type: String,
        trim: true,
        default: "",
    },

    // Optional product video (uploaded straight from the device to Cloudinary)
    video: {
        type: new mongoose.Schema({
            url: { type: String, trim: true },
            public_id: { type: String, trim: true },
            thumbnail_url: { type: String, trim: true, default: "" },
        }, { _id: false }),
        default: null,
    },

    // Which size labels the website shows (admin chooses): "in" | "uk" | "us" | "eu"
    sizeSystems: {
        type: [{ type: String, enum: ["in", "uk", "us", "eu"] }],
        default: ["in", "uk", "us", "eu"],
    },

    // SEO – used for <title>, meta description, keywords & social previews
    seo: {
        metaTitle: { type: String, trim: true, default: "" },
        metaDescription: { type: String, trim: true, default: "" },
        keywords: { type: [String], default: [] },
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

