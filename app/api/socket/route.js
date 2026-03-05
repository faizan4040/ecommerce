import { Server } from "socket.io"
import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import Chat from "@/models/Chat"
import ChatMessage from "@/models/ChatMessage"

let io

export async function GET(req) {
  if (!io) {
    io = new Server({
      path: "/api/socket",
      cors: { origin: "*" },
    })

    io.on("connection", socket => {
      console.log(" socket connected", socket.id)

      socket.on("join-room", roomId => {
        socket.join(roomId)
        console.log("joined room:", roomId)
      })

      socket.on("send-message", async data => {
        const { roomId, senderId, message, senderType } = data
        await connectDB()

        const msg = await ChatMessage.create({
          sender: senderId,
          content: message,
          chat: roomId,
          status: "sent",
        })

        await Chat.findByIdAndUpdate(roomId, {
          lastMessage: msg._id,
        })

        io.to(roomId).emit("receive-message", {
          _id: msg._id,
          message,
          senderType,
        })
      })

      socket.on("disconnect", () => {
        console.log(" socket disconnected", socket.id)
      })
    })
  }

  return NextResponse.json({ success: true })
}