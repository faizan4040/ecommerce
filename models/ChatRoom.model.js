// models/ChatRoom.model.js  – keep in sync with socket-server/models.js
import mongoose from "mongoose";

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
);

export default mongoose.models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema);
