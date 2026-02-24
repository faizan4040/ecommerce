import mongoose from "mongoose";
import connectDB from "@/lib/databaseConnection";

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  visitorName: { type: String },
  message: { type: String, required: true },
  from: { type: String, enum: ["user", "admin"], required: true },
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export async function insertChat(chat) {
  await connectDB();
  return Chat.create(chat);
}

export async function getChats() {
  await connectDB();
  return Chat.find({}).sort({ timestamp: 1 });
}

export async function getChatsByUserId(userId) {
  await connectDB();
  return Chat.find({ userId }).sort({ timestamp: 1 });
}

export async function sendAdminMessage(chat) {
  await connectDB();
  return Chat.create({ ...chat, from: "admin", timestamp: new Date() });
}