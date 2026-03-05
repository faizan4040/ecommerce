import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import Message from "@/models/Message.model";

/* ================================
   GET MESSAGES BY ROOM ID
   ================================ */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "roomId is required" },
        { status: 400 }
      );
    }

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 }); // oldest → newest

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("❌ GET messages error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/* ================================
   CREATE MESSAGE (OPTIONAL – FALLBACK)
   ================================ */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { roomId, senderType, senderId, message } = body;

    if (!roomId || !senderType || !senderId || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const newMessage = await Message.create({
      roomId,
      senderType,
      senderId,
      message,
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("❌ POST message error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}