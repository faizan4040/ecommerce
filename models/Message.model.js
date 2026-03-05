import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },

    senderType: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default MessageModel;