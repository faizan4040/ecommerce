import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import connectDB from "@/lib/databaseConnection"
import { getChatSession } from "@/lib/chatAuth"
import UserModel from "@/models/User.model"

/**
 * GET /api/chat/token
 * Short-lived token the browser uses to connect to the chat socket server.
 * Name & profile photo come fresh from the database.
 */
export async function GET() {
  const session = await getChatSession()
  if (!session) {
    return NextResponse.json({ success: false, message: "Please log in to use chat." }, { status: 401 })
  }

  await connectDB()
  const user = await UserModel.findById(session.id).select("name avatar role deletedAt").lean()
  if (!user || user.deletedAt) {
    return NextResponse.json({ success: false, message: "Account not found." }, { status: 401 })
  }

  const profile = {
    _id: String(user._id),
    role: user.role,
    name: user.name || (user.role === "admin" ? "Support" : "Customer"),
    avatar: user.avatar?.url || "",
  }

  const token = await new SignJWT({ typ: "chat", role: profile.role, name: profile.name, avatar: profile.avatar })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(profile._id)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(process.env.SECRET_KEY))

  return NextResponse.json({ success: true, data: { token, user: profile } })
}
