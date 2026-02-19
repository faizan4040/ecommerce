import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import ChatModel from "@/models/Chat.model";
import { catchError, response } from "@/lib/helperfunction";

export async function GET() {
  try {
    const auth = await isAuthenticated("user");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const messages = await ChatModel.find({
      user: auth.user._id,
    }).sort({ createdAt: 1 });

    return response(true, 200, "Messages fetched.", messages);
  } catch (error) {
    return catchError(error);
  }
}
