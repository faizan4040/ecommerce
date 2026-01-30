import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    discountPercentage: {
      type: Number,
      required: true,
    },

    minShoppingAmount: {
      type: Number,
      required: true,
    },

    validity: {
      type: Date,
      required: true,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const ReviewModel =
  mongoose.models.Review || mongoose.model("Review", reviewSchema, "review");

export default ReviewModel;


