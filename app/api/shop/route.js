import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import CategoryModel from "@/models/Category.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";

/*
 * Shop listing with filters.
 * Filters are applied to live variants FIRST, then products are sorted & paginated,
 * so every page is full and counts are correct.
 *
 * Query: category, size, color, gender, minPrice, maxPrice, q, sort, page, limit
 * Returns: { products, nextPage, total, priceRange: { min, max } }
 * Each product has `colors` (same shape as /product/get-feature-product) for the product cards.
 */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export async function GET(request) {
  try {
    await connectDB()
    const sp = request.nextUrl.searchParams

    const sizes = sp.get("size")?.split(",").filter(Boolean) || []
    const colors = sp.get("color")?.split(",").filter(Boolean) || []
    const gender = sp.get("gender")
    const minPrice = Number(sp.get("minPrice")) || 0
    const maxPrice = Number(sp.get("maxPrice")) || 0 // 0 = no upper limit
    const categorySlug = sp.get("category")
    const search = sp.get("q")?.trim()
    const limit = Math.min(Math.max(parseInt(sp.get("limit")) || 12, 1), 48)
    const page = Math.max(parseInt(sp.get("page")) || 0, 0)
    const sort = sp.get("sort") || "default_sorting"

    /* ---------- product-level match ---------- */
    const match = { deletedAt: null }
    if (categorySlug) {
      const cats = await CategoryModel.find({ deletedAt: null, slug: { $in: categorySlug.split(",") } }, "_id").lean()
      match.category = { $in: cats.map((c) => c._id) }
    }
    if (search) {
      const rx = { $regex: escapeRegex(search), $options: "i" }
      match.$or = [{ name: rx }, { brand: rx }, { "seo.keywords": rx }]
    }

    /* ---------- variant-level filters ---------- */
    const variantConds = [{ $eq: ["$$v.deletedAt", null] }]
    if (sizes.length) variantConds.push({ $in: ["$$v.size", sizes] })
    if (colors.length) variantConds.push({ $in: ["$$v.color", colors] })
    if (gender) variantConds.push({ $eq: ["$$v.gender", gender] })
    if (minPrice) variantConds.push({ $gte: ["$$v.sellingPrice", minPrice] })
    if (maxPrice) variantConds.push({ $lte: ["$$v.sellingPrice", maxPrice] })
    const variantFilterActive = variantConds.length > 1

    const sortStage =
      sort === "asc" ? { name: 1 }
      : sort === "desc" ? { name: -1 }
      : sort === "price_low_high" ? { price: 1, createdAt: -1 }
      : sort === "price_high_low" ? { price: -1, createdAt: -1 }
      : sort === "discount" ? { discountPercentage: -1, createdAt: -1 }
      : { createdAt: -1 }

    const [result] = await ProductModel.aggregate([
      { $match: match },
      { $lookup: { from: "productvariants", localField: "_id", foreignField: "product", as: "allVariants" } },
      {
        $addFields: {
          variants: { $filter: { input: "$allVariants", as: "v", cond: { $and: variantConds } } },
        },
      },
      // with variant filters → product must have a matching variant; without → show every product
      ...(variantFilterActive ? [{ $match: { $expr: { $gt: [{ $size: "$variants" }, 0] } } }] : []),
      {
        $addFields: {
          price: { $ifNull: [{ $min: "$variants.sellingPrice" }, "$sellingPrice"] },
        },
      },
      { $sort: sortStage },
      {
        $facet: {
          total: [{ $count: "n" }],
          data: [
            { $skip: page * limit },
            { $limit: limit + 1 },
            { $lookup: { from: "media", localField: "media", foreignField: "_id", as: "media" } },
            { $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "category" } },
            { $addFields: { category: { $arrayElemAt: ["$category", 0] } } },
            // show every colour of the product on the card (not only the filtered ones)
            {
              $addFields: {
                cardVariants: {
                  $filter: {
                    input: "$allVariants",
                    as: "v",
                    cond: { $and: [{ $eq: ["$$v.deletedAt", null] }, ...(gender ? [{ $eq: ["$$v.gender", gender] }] : [])] },
                  },
                },
              },
            },
            { $lookup: { from: "media", localField: "cardVariants.media", foreignField: "_id", as: "variantMedia" } },
            {
              $project: {
                name: 1, slug: 1, brand: 1, mrp: 1, sellingPrice: 1, discountPercentage: 1, description: 1,
                sizeSystems: 1, createdAt: 1, price: 1,
                "category.name": 1, "category.slug": 1,
                media: { $map: { input: "$media", as: "m", in: { _id: "$$m._id", secure_url: "$$m.secure_url", alt: "$$m.alt" } } },
                variantMedia: { $map: { input: "$variantMedia", as: "m", in: { _id: "$$m._id", secure_url: "$$m.secure_url" } } },
                cardVariants: { _id: 1, color: 1, colorCode: 1, gender: 1, size: 1, stock: 1, mrp: 1, sellingPrice: 1, media: 1, createdAt: 1 },
              },
            },
          ],
        },
      },
    ])

    const total = result?.total?.[0]?.n || 0
    let products = result?.data || []
    let nextPage = null
    if (products.length > limit) {
      nextPage = page + 1
      products = products.slice(0, limit)
    }

    // Group each product's variants by colour (card swatches + sizes)
    products = products.map(({ cardVariants = [], variantMedia = [], ...p }) => {
      const mediaById = new Map(variantMedia.map((m) => [String(m._id), m.secure_url]))
      const groups = new Map()
      for (const v of [...cardVariants].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))) {
        if (!groups.has(v.color)) {
          groups.set(v.color, {
            name: v.color,
            code: v.colorCode || "",
            gender: v.gender,
            image: mediaById.get(String(v.media?.[0])) || "",
            sizes: [],
          })
        }
        groups.get(v.color).sizes.push({ variantId: v._id, size: v.size, stock: v.stock, mrp: v.mrp, sellingPrice: v.sellingPrice })
      }
      return { ...p, colors: [...groups.values()] }
    })

    // Price bounds for the price slider (all live variants)
    const [bounds] = await ProductVariantModel.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, min: { $min: "$sellingPrice" }, max: { $max: "$sellingPrice" } } },
    ])

    return response(true, 200, "Product data found", {
      products,
      nextPage,
      total,
      priceRange: { min: Math.floor(bounds?.min || 0), max: Math.ceil(bounds?.max || 10000) },
    })
  } catch (error) {
    return catchError(error)
  }
}
