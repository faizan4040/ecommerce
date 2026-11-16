import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { calcDiscount } from "@/lib/pricing";
import { productUpdateSchema } from "@/lib/productSchemas";
import ProductModel from "@/models/Product.model";
import { encode } from "entities";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.")
    }

    await connectDB()
    const payload = await request.json()

    const validate = productUpdateSchema.safeParse(payload)
    if (!validate.success) {
      const first = validate.error.issues?.[0]?.message || "Invalid or missing fields."
      return response(false, 400, first, validate.error)
    }
    const data = validate.data

    const product = await ProductModel.findOne({ deletedAt: null, _id: data._id })
    if (!product) {
      return response(false, 404, "Data not found.")
    }

    const slugTaken = await ProductModel.exists({ slug: data.slug, _id: { $ne: data._id } })
    if (slugTaken) {
      return response(false, 409, "This slug is already used by another product.")
    }

    product.name = data.name
    product.slug = data.slug
    product.category = data.category
    product.brand = data.brand
    product.mrp = data.mrp
    product.sellingPrice = data.sellingPrice
    product.discountPercentage = calcDiscount(data.mrp, data.sellingPrice)
    product.description = encode(data.description)
    product.media = data.media
    product.video = data.video || null
    product.sizeSystems = data.sizeSystems
    product.seo = {
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      keywords: [...new Set(data.keywords.map((k) => k.toLowerCase()))],
    }
    await product.save()

    return response(true, 200, "Product updated successfully.")
  } catch (error) {
    return catchError(error)
  }
}
