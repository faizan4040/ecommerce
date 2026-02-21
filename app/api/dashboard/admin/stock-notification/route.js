import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import ProductVariantModel from "@/models/ProductVariant.model"
import OrderModel from "@/models/Order.model"

const LOW_STOCK_LIMIT = 5

export async function GET() {
  try {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 403, "Unauthorized")

    await connectDB()

    const soldData = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.variantId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
    ])

    const soldMap = {}
    soldData.forEach(i => {
      soldMap[i._id.toString()] = i.totalSold
    })

    const variants = await ProductVariantModel.find({ deletedAt: null })
      .populate("product", "name")
      .populate("media", "url")
      .lean()

    const stockTable = variants.map(v => {
      const sold = soldMap[v._id.toString()] || 0

      return {
        variantId: v._id,
        productName: v.product?.name,
        sku: v.sku,
        image: v.media?.[0]?.url,
        totalSold: sold,
        remainingStock: v.stock,
        isLowStock: v.stock <= LOW_STOCK_LIMIT && v.stock > 0,
        isOutOfStock: v.stock === 0,
      }
    })

    const mostSold = [...stockTable]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)

    return response(true, 200, "Stock fetched", {
      stockTable,
      mostSold,
    })
  } catch (error) {
    return catchError(error)
  }
}