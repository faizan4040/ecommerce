import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { response, catchError } from "@/lib/helperfunction"
import OrderModel from "@/models/Order.model"
import ProductVariantModel from "@/models/ProductVariant.model"

const LOW_STOCK_LIMIT = 5

export async function GET() {
  try {
    // Admin Auth
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized")
    }

    await connectDB()

    // Total sold per variant (from REAL orders)
    const soldData = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.variantId",
          totalSold: { $sum: "$products.qty" },
        },
      },
    ])

    const soldMap = {}
    soldData.forEach(item => {
      soldMap[item._id.toString()] = item.totalSold
    })

    // Fetch variants WITH product images
    const variants = await ProductVariantModel.find({
      deletedAt: null,
    })
      .populate("product", "name thumbnail")
      .lean()

    // Build stock table
      const stockTable = variants.map(v => {
      const sold = soldMap[v._id.toString()] || 0
      const remaining = Number(v.stock ?? 0)

      let status = "In Stock"
      if (remaining === 0) status = "Out of Stock"
      else if (remaining <= LOW_STOCK_LIMIT) status = "Low Stock"

      return {
        variantId: v._id,
        productName: v.product?.name || "—",
        sku: v.sku,
        image: v.product?.thumbnail || null,
        totalSold: sold,
        remainingStock: remaining,
        status,
      }
    })

    // Low stock notifications
    const lowStock = stockTable.filter(item => item.status === "Low Stock")

    // Most sold products
    const mostSold = [...stockTable]
      .filter(item => item.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)

    return response(true, 200, "Stock report fetched", {
      stockTable,
      mostSold,
      lowStock,
    })

  } catch (error) {
    console.error("STOCK REPORT ERROR:", error)
    return catchError(error)
  }
}