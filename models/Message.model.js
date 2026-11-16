// models/Message.model.js  – keep in sync with socket-server/models.js
import mongoose from "mongoose";

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
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
