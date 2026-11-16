import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { calcDiscount } from "@/lib/pricing";
import { variantUpdatePayloadSchema } from "@/lib/productSchemas";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.")
    }

    await connectDB()
    const payload = await request.json()

    const validate = variantUpdatePayloadSchema.safeParse(payload)
    if (!validate.success) {
      const first = validate.error.issues?.[0]?.message || "Invalid or missing fields."
      return response(false, 400, first, validate.error)
    }
    const data = validate.data

    const variant = await ProductVariantModel.findOne({ deletedAt: null, _id: data._id })
    if (!variant) {
      return response(false, 404, "Data not found.")
    }

    const sku = data.sku.toUpperCase()
    const skuTaken = await ProductVariantModel.exists({ sku, _id: { $ne: data._id } })
    if (skuTaken) {
      return response(false, 409, `SKU "${sku}" already exists.`)
    }

    const duplicate = await ProductVariantModel.exists({
      _id: { $ne: data._id },
      product: data.product,
      gender: data.gender,
      color: new RegExp(`^${data.color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      size: data.size,
      deletedAt: null,
    })
    if (duplicate) {
      return response(false, 409, "Another variant already has this colour and size.")
    }

    variant.product = data.product
    variant.color = data.color
    variant.colorCode = data.colorCode
    variant.size = data.size
    variant.gender = data.gender
    variant.sku = sku
    variant.stock = data.stock
    variant.mrp = data.mrp
    variant.sellingPrice = data.sellingPrice
    variant.discountPercentage = calcDiscount(data.mrp, data.sellingPrice)
    variant.media = data.media
    await variant.save()

    return response(true, 200, "Product Variant updated successfully.")
  } catch (error) {
    return catchError(error)
  }
}
