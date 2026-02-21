import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET() {
  try {
    await connectDB();

    const LOW_STOCK_THRESHOLD = 5;

    const stocks = await ProductVariantModel.find({
      stock: { $lte: LOW_STOCK_THRESHOLD },
      deletedAt: null,
    })
      .populate("product", "name")
      .sort({ stock: 1 });

    if (!stocks.length) {
      return response(true, 200, "No low-stock products found.", []);
    }

    return response(
      true,
      200,
      "Low-stock products fetched successfully.",
      stocks
    );
  } catch (error) {
    return catchError(error);
  }
}