import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { sortSizes } from "@/lib/shoeSizes";
import "@/models/Category.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ReviewModel from "@/models/Review.model";

/*
 * Product details for the website.
 * Returns the product, the selected variant AND every live variant, so the page can
 * switch colour / size instantly on the client without reloading.
 */
export async function GET(request, { params }) {
  try {
    await connectDB()

    const { slug } = await params
    if (!slug) {
      return response(false, 404, "Product not found.")
    }

    const searchParams = request.nextUrl.searchParams
    const size = searchParams.get("size")
    const color = searchParams.get("color")

    const product = await ProductModel.findOne({ slug, deletedAt: null })
      .populate("media", "secure_url alt title")
      .populate("category", "name slug")
      .lean()

    if (!product) {
      return response(false, 404, "Product not found.")
    }

    const variants = await ProductVariantModel.find({ product: product._id, deletedAt: null })
      .populate("media", "secure_url alt title")
      .sort({ createdAt: 1 })
      .lean()

    // Pick the requested variant → same colour any size → first in stock → first
    const variant =
      variants.find((v) => (!color || v.color === color) && (!size || v.size === size)) ||
      variants.find((v) => v.color === color) ||
      variants.find((v) => v.stock > 0) ||
      variants[0] ||
      null

    // Colours with swatch + first image (for colour thumbnails)
    const colorMap = new Map()
    for (const v of variants) {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, {
          name: v.color,
          code: v.colorCode || "",
          image: v.media?.[0]?.secure_url || "",
          inStock: false,
        })
      }
      if (v.stock > 0) colorMap.get(v.color).inStock = true
    }

    const gender = variant?.gender || variants[0]?.gender || "men"
    const sizes = sortSizes(gender, [...new Set(variants.map((v) => v.size))])

    const [reviewCount, ratingAgg] = await Promise.all([
      ReviewModel.countDocuments({ product: product._id, deletedAt: null }),
      ReviewModel.aggregate([
        { $match: { product: product._id, deletedAt: null } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ])

    return response(true, 200, "Product data found.", {
      product,
      variant,
      variants,
      colors: [...colorMap.values()],
      sizes,
      reviewCount,
      rating: ratingAgg[0]?.avg ? Math.round(ratingAgg[0].avg * 10) / 10 : 0,
    })
  } catch (error) {
    return catchError(error)
  }
}
