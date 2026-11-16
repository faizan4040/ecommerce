import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductModel from "@/models/Product.model";

/*
 * Products for the website cards (Feature Products / New in Footwear).
 * Each product comes with its live colour variants, so cards can show colour swatches,
 * sizes and add straight to cart.
 *
 *   product.colors = [{ name, code, image, sizes: [{ variantId, size, stock, mrp, sellingPrice }] }]
 */
export async function GET(request) {
  try {
    await connectDB()

    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "0", 10) || 0, 100)

    const pipeline = [
      { $match: { deletedAt: null } },
      { $sort: { createdAt: -1 } },
      ...(limit ? [{ $limit: limit }] : []),

      { $lookup: { from: "media", localField: "media", foreignField: "_id", as: "media" } },
      { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
      { $addFields: { category: { $arrayElemAt: ["$category", 0] } } },

      {
        $lookup: {
          from: "productvariants",
          let: { pid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product", "$$pid"] }, deletedAt: null } },
            { $sort: { createdAt: 1 } },
            { $lookup: { from: "media", localField: "media", foreignField: "_id", as: "media" } },
            {
              $group: {
                _id: "$color",
                code: { $first: "$colorCode" },
                gender: { $first: "$gender" },
                image: { $first: { $arrayElemAt: ["$media.secure_url", 0] } },
                firstAt: { $first: "$createdAt" },
                sizes: {
                  $push: {
                    variantId: "$_id",
                    size: "$size",
                    stock: "$stock",
                    mrp: "$mrp",
                    sellingPrice: "$sellingPrice",
                  },
                },
              },
            },
            { $sort: { firstAt: 1 } },
            { $project: { _id: 0, name: "$_id", code: 1, gender: 1, image: 1, sizes: 1 } },
          ],
          as: "colors",
        },
      },

      {
        $project: {
          name: 1,
          slug: 1,
          brand: 1,
          sizeSystems: 1,
          mrp: 1,
          sellingPrice: 1,
          discountPercentage: 1,
          description: 1,
          createdAt: 1,
          "category.name": 1,
          "category.slug": 1,
          media: { $map: { input: "$media", as: "m", in: { _id: "$$m._id", secure_url: "$$m.secure_url" } } },
          colors: 1,
        },
      },
    ]

    const products = await ProductModel.aggregate(pipeline)

    if (!products.length) {
      return response(false, 404, "Products not found")
    }

    return response(true, 200, "Products found.", products)
  } catch (error) {
    return catchError(error)
  }
}
