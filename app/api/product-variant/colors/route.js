import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductVariantModel from "@/models/ProductVariant.model";

/* Distinct live colours with their swatch code: [{ name, code }] – used by the shop filter */
export async function GET() {
  try {
    await connectDB()

    const colors = await ProductVariantModel.aggregate([
      { $match: { deletedAt: null } },
      { $sort: { createdAt: 1 } },
      { $group: { _id: "$color", code: { $first: "$colorCode" } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: "$_id", code: 1 } },
    ])

    return response(true, 200, "Color found.", colors)
  } catch (error) {
    return catchError(error)
  }
}
