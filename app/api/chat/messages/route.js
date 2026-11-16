import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/databaseConnection"
import { getChatSession } from "@/lib/chatAuth"
import Message from "@/models/Message.model"
import ChatRoom from "@/models/ChatRoom.model"

const PAGE = 40

/**
 * GET /api/chat/messages?roomId=…&before=<ISO date>
 * Latest 40 messages (oldest → newest) + hasMore. Only the conversation's customer or an admin may read it.
 * Sending / editing / deleting happens over the socket server.
 */
export async function GET(req) {
  const session = await getChatSession()
  if (!session) return NextResponse.json({ success: false, message: "Please log in to use chat." }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get("roomId")
  const before = searchParams.get("before")
  if (!mongoose.isValidObjectId(roomId)) {
    return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 })
  }

  await connectDB()
  const room = await ChatRoom.findById(roomId).lean()
  if (!room || (session.role !== "admin" && String(room.userId) !== session.id)) {
    return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 })
  }

  const filter = { roomId }
  if (before && !Number.isNaN(Date.parse(before))) filter.createdAt = { $lt: new Date(before) }

  const rows = await Message.find(filter).sort({ createdAt: -1 }).limit(PAGE + 1).lean()
  const hasMore = rows.length > PAGE
  const messages = rows.slice(0, PAGE).reverse().map((m) => ({
    ...m,
    _id: String(m._id),
    roomId: String(m.roomId),
    senderId: String(m.senderId),
    // never send the text of deleted messages
    ...(m.deletedAt ? { message: "", fileUrl: null, fileName: null, fileType: null } : {}),
  }))

  return NextResponse.json({ success: true, data: { messages, hasMore } })
}
