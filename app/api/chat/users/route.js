import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ChatModel from "@/models/Chat.model";

export async function POST(request) {
  try {
    // ✅ Authenticate USER
    const auth = await isAuthenticated("user");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const body = await request.json();

    if (!body.message) {
      return response(false, 400, "Message is required.");
    }

    await ChatModel.create({
      user: auth.user._id,
      senderRole: "user",
      message: body.message,
    });

    return response(true, 200, "Message sent.");
  } catch (error) {
    return catchError(error);
  }
}
