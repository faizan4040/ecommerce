import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { calcDiscount } from "@/lib/pricing";
import { productPayloadSchema } from "@/lib/productSchemas";
import ProductModel from "@/models/Product.model";
import { encode } from "entities";

export async function POST(request) {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.")
    }

    await connectDB()
    const payload = await request.json()

    const validate = productPayloadSchema.safeParse(payload)
    if (!validate.success) {
      const first = validate.error.issues?.[0]?.message || "Invalid or missing fields."
      return response(false, 400, first, validate.error)
    }
    const data = validate.data

    const slugTaken = await ProductModel.exists({ slug: data.slug })
    if (slugTaken) {
      return response(false, 409, "This slug is already used by another product.")
    }

    const product = new ProductModel({
      name: data.name,
      slug: data.slug,
      category: data.category,
      brand: data.brand,
      mrp: data.mrp,
      sellingPrice: data.sellingPrice,
      // never trust the client for the discount – always recalculate
      discountPercentage: calcDiscount(data.mrp, data.sellingPrice),
      description: encode(data.description),
      media: data.media,
      video: data.video || null,
      sizeSystems: data.sizeSystems,
      seo: {
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: [...new Set(data.keywords.map((k) => k.toLowerCase()))],
      },
    })

    await product.save()

    return response(true, 200, "Product added successfully.", { _id: product._id })
  } catch (error) {
    return catchError(error)
  }
}
