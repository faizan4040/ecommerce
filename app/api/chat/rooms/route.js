import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/databaseConnection"
import { getChatSession } from "@/lib/chatAuth"
import ChatRoom from "@/models/ChatRoom.model"
import "@/models/User.model"

const unauthorized = () => NextResponse.json({ success: false, message: "Please log in to use chat." }, { status: 401 })

/**
 * GET /api/chat/rooms
 *  - admin    → every conversation with the customer's name, email & photo (newest first)
 *  - customer → their own conversation (or null)
 */
export async function GET() {
  const session = await getChatSession()
  if (!session) return unauthorized()
  await connectDB()

  if (session.role !== "admin") {
    const room = await ChatRoom.findOne({ userId: session.id }).lean()
    return NextResponse.json({ success: true, data: room })
  }

  const rooms = await ChatRoom.aggregate([
    { $sort: { lastMessageAt: -1 } },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $addFields: { user: { $arrayElemAt: ["$user", 0] } } },
    {
      $project: {
        userId: 1, lastMessage: 1, lastMessageAt: 1, lastSenderType: 1, unreadForAdmin: 1, unreadForUser: 1, createdAt: 1,
        "user._id": 1, "user.name": 1, "user.email": 1, "user.phone": 1, "user.avatar": 1, "user.createdAt": 1,
      },
    },
  ])
  return NextResponse.json({ success: true, data: rooms })
}

/**
 * POST /api/chat/rooms
 * Customer: get or create their own conversation (the user id comes from the login cookie).
 */
export async function POST() {
  const session = await getChatSession()
  if (!session) return unauthorized()
  if (session.role === "admin") {
    return NextResponse.json({ success: false, message: "Admins reply from the dashboard chat." }, { status: 400 })
  }
  if (!mongoose.isValidObjectId(session.id)) return unauthorized()

  await connectDB()
  const room = await ChatRoom.findOneAndUpdate(
    { userId: session.id },
    { $setOnInsert: { userId: session.id, lastMessageAt: new Date() } },
    { upsert: true, new: true }
  ).lean()

  return NextResponse.json({ success: true, data: room })
}
