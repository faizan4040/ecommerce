import mongoose from "mongoose"

const ProductVariantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    color:{
        type: String,
        required: true,
        trim: true,
    },

    // Hex code used to draw the colour swatch on the website, e.g. "#1f2937"
    colorCode: {
        type: String,
        trim: true,
        default: "",
    },

    size: {
        type: String,
        required: true,
        trim: true,
    },

    gender: {
        type: String,
        enum: ['men', 'women', 'kids'],
        required: true,
        index: true
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

    sku: {
        type: String,
        required: true,
        unique: true,
    },

    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },

    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Media",
            required: true
        },
    ],

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, {timestamps: true})



const ProductVariantModel = mongoose.models.ProductVariant || mongoose.model
('ProductVariant', ProductVariantSchema, 'productvariants');

export default ProductVariantModel;

