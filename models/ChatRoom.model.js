import mongoose from "mongoose";

const ChatRoomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    lastMessage: String,

    lastMessageAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema);