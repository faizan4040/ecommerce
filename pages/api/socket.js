import { Server } from "socket.io";
import connectDB from "@/lib/databaseConnection";
import ChatModel from "@/models/Chat.model";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🔥 Socket server started");

    await connectDB();

    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("⚡ Client connected:", socket.id);

      const { userId, role } = socket.handshake.query;

      if (!userId || !role) {
        socket.disconnect();
        return;
      }

      const room = `chat_${userId}`;
      socket.join(room);

      console.log(`${role} joined ${room}`);

      // ================= SEND MESSAGE =================
      socket.on("send_message", async (data) => {
        try {
          if (!data?.message) return;

          const newMessage = await ChatModel.create({
            user: userId,
            senderRole: role,
            message: data.message,
          });

          io.to(room).emit("receive_message", newMessage);
        } catch (error) {
          console.error("❌ Message error:", error);
        }
      });

      // ================= TYPING =================
      socket.on("typing", () => {
        socket.to(room).emit("user_typing", role);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
      });
    });
  }

  res.end();
}
