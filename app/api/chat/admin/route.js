import { isAuthenticated } from "@/lib/authentication";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import ChatModel from "@/models/Chat.model";

export async function POST(request) {
  try {
    // ✅ Authenticate ADMIN
    const auth = await isAuthenticated("admin");
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.");
    }

    await connectDB();

    const body = await request.json();

    if (!body.message || !body.userId) {
      return response(false, 400, "Message & userId required.");
    }

    await ChatModel.create({
      user: body.userId,
      senderRole: "admin",
      message: body.message,
    });

    return response(true, 200, "Reply sent.");
  } catch (error) {
    return catchError(error);
  }
}
