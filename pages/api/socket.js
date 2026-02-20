import { Server } from "socket.io";
import dbConnect from "@/lib/db";
import Chat from "@/models/Chat";

export const config = {
  api: {
    bodyParser: false,
  },
};

let io;

export default async function handler(req, res) {
  if (!io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Join room by userId
      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
      });

      // Handle chat message
      socket.on("chatMessage", async (data) => {
        try {
          await dbConnect();
          const chat = await Chat.create(data);
          io.to(data.userId).emit("newMessage", chat); // send to user room
          io.to(data.adminId).emit("newMessage", chat); // send to admin room
        } catch (err) {
          console.log(err);
        }
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });
  }

  res.end();
}