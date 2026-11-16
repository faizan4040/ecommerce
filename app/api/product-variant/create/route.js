import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { calcDiscount } from "@/lib/pricing";
import { variantBulkPayloadSchema } from "@/lib/productSchemas";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";

/*
 * Add Variant – one colour with many sizes.
 * Creates ONE variant document per size (each size keeps its own SKU & stock),
 * which is what cart, orders and stock reports already expect.
 */
export async function POST(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.")
    }

    await connectDB()
    const payload = await request.json()

    const validate = variantBulkPayloadSchema.safeParse(payload)
    if (!validate.success) {
      const first = validate.error.issues?.[0]?.message || "Invalid or missing fields."
      return response(false, 400, first, validate.error)
    }
    const data = validate.data

    const product = await ProductModel.exists({ _id: data.product, deletedAt: null })
    if (!product) {
      return response(false, 404, "Product not found.")
    }

    // No duplicate sizes / SKUs inside the request
    const sizeList = data.sizes.map((s) => s.size)
    const skuList = data.sizes.map((s) => s.sku.toUpperCase())
    if (new Set(sizeList).size !== sizeList.length) {
      return response(false, 400, "The same size is added twice.")
    }
    if (new Set(skuList).size !== skuList.length) {
      return response(false, 400, "Every size needs a different SKU.")
    }

    // No clash with existing data
    const existingSku = await ProductVariantModel.findOne({ sku: { $in: skuList } }, "sku").lean()
    if (existingSku) {
      return response(false, 409, `SKU "${existingSku.sku}" already exists.`)
    }

    const colorRegex = new RegExp(`^${data.color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
    const existingSizes = await ProductVariantModel.find(
      { product: data.product, gender: data.gender, color: colorRegex, size: { $in: sizeList }, deletedAt: null },
      "size"
    ).lean()
    if (existingSizes.length) {
      return response(
        false,
        409,
        `Size ${existingSizes.map((v) => v.size).join(", ")} already exists for this colour. Edit it instead.`
      )
    }

    const discountPercentage = calcDiscount(data.mrp, data.sellingPrice)

    const docs = data.sizes.map((s) => ({
      product: data.product,
      color: data.color,
      colorCode: data.colorCode,
      gender: data.gender,
      size: s.size,
      sku: s.sku.toUpperCase(),
      stock: s.stock,
      mrp: data.mrp,
      sellingPrice: data.sellingPrice,
      discountPercentage,
      media: data.media,
    }))

    await ProductVariantModel.insertMany(docs)

    return response(
      true,
      200,
      `${docs.length} variant${docs.length > 1 ? "s" : ""} added successfully.`
    )
  } catch (error) {
    return catchError(error)
  }
}
