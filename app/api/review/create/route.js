import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { zSchema } from "@/lib/zodSchema"
import ReviewModel from "@/models/Review.model"

export async function POST(request) {
  try {
    // 1️⃣ Auth check
    const auth = await isAuthenticated("user")
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized.")
    }

    // 2️⃣ DB connect
    await connectDB()

    // 3️⃣ Payload
    const payload = await request.json()

    // 4️⃣ Validate
    const schema = zSchema.pick({
      productId: true,
      userId: true,
      rating: true,
      title: true,
      review: true,
    })

    const validate = schema.safeParse(payload)
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields.", validate.error)
    }

    const { productId, userId, rating, title, review } = validate.data

    // 5️⃣ Save review
    const newReview = new ReviewModel({
      product: productId, // 🔥 mapping
      user: userId,
      rating,
      title,
      review,
    })

    await newReview.save()

    return response(true, 200, "Your review submitted successfully.")
  } catch (error) {
    return catchError(error)
  }
}
