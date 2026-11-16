import mongoose from "mongoose"

/*
 * Same collections as the Next.js app ("chatrooms" and "messages").
 * Keep these fields in sync with models/ChatRoom.model.js and models/Message.model.js.
 */

const ChatRoomSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    lastSenderType: { type: String, enum: ["user", "admin", null], default: null },
    unreadForAdmin: { type: Number, default: 0 },
    unreadForUser: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const MessageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true, index: true },
    senderType: { type: String, enum: ["user", "admin"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderName: { type: String, default: "" },
    senderAvatar: { type: String, default: "" },
    message: { type: String, trim: true, default: "" },
    messageType: { type: String, enum: ["text", "image", "file"], default: "text" },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    fileType: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema)
export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema)
