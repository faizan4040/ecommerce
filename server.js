// ============================================================
//  server.js  —  project ROOT  (replaces `next dev` / `next start`)
//  Run:  node server.js  OR  npm run dev  (after updating package.json)
// ============================================================
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

require("dotenv").config({ path: ".env.local" });

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// ── Mongoose connection ──────────────────────────────────────────────────────
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

// ── Inline schemas (avoids ESM/CJS conflicts in server.js) ──────────────────
const MessageSchema = new mongoose.Schema(
  {
    roomId:     { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true, index: true },
    senderType: { type: String, enum: ["user", "admin"], required: true },
    senderId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    message:    { type: String, required: true, trim: true },
    isRead:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatRoomSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    adminId:       { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    lastMessage:   { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    isOpen:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Message  = mongoose.models.Message  || mongoose.model("Message",  MessageSchema);
const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema);

// ── Track online users: Map<userId, socketId> ────────────────────────────────
const onlineUsers = new Map();

// ── Boot ─────────────────────────────────────────────────────────────────────
app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // ── Socket.IO events ───────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(` Socket connected: ${socket.id}`);

    // ── Register user / admin as online ─────────────────────────────────────
    socket.on("user-online", ({ userId, role }) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.role   = role;

      // Notify admins that this user is online
      io.emit("presence-update", { userId, status: "online" });
      console.log(`👤 ${role} online: ${userId}`);
    });

    // ── Join a chat room ─────────────────────────────────────────────────────
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // ── Typing indicator ─────────────────────────────────────────────────────
    socket.on("typing", ({ roomId, senderType }) => {
      socket.to(roomId).emit("user-typing", { roomId, senderType });
    });

    socket.on("stop-typing", ({ roomId, senderType }) => {
      socket.to(roomId).emit("user-stop-typing", { roomId, senderType });
    });

    // ── Send message ─────────────────────────────────────────────────────────
    socket.on("send-message", async (data) => {
      const { roomId, senderType, senderId, message } = data;

      if (!roomId || !senderType || !senderId || !message?.trim()) {
        socket.emit("error", { message: "Invalid message payload" });
        return;
      }

      try {
        await connectDB();

        // Save message
        const msg = await Message.create({
          roomId,
          senderType,
          senderId: new mongoose.Types.ObjectId(senderId),
          message:  message.trim(),
        });

        // Update room
        await ChatRoom.findByIdAndUpdate(roomId, {
          lastMessage:   message.trim(),
          lastMessageAt: new Date(),
        });

        const payload = {
          _id:        msg._id.toString(),
          roomId:     roomId.toString(),
          senderType,
          senderId:   senderId.toString(),
          message:    msg.message,
          isRead:     false,
          createdAt:  msg.createdAt,
        };

        // Broadcast to everyone in the room
        io.to(roomId).emit("receive-message", payload);

        // Also notify admin sidebar (new message badge)
        io.emit("room-updated", {
          roomId,
          lastMessage:   message.trim(),
          lastMessageAt: new Date(),
          senderType,
        });

        console.log(`[${senderType}] room ${roomId}: ${message.trim()}`);
      } catch (err) {
        console.error(" send-message error:", err.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── Mark messages as read ────────────────────────────────────────────────
    socket.on("mark-read", async ({ roomId, readerType }) => {
      try {
        await connectDB();
        const senderFilter = readerType === "admin" ? "user" : "admin";
        await Message.updateMany(
          { roomId, senderType: senderFilter, isRead: false },
          { isRead: true }
        );
        io.to(roomId).emit("messages-read", { roomId, readerType });
      } catch (err) {
        console.error(" mark-read error:", err.message);
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("presence-update", { userId, status: "offline" });
        console.log(` ${socket.data.role || "user"} offline: ${userId}`);
      }
      console.log(` Socket disconnected: ${socket.id}`);
    });
  });

  // ── Start server ───────────────────────────────────────────────────────────
  httpServer.listen(PORT, () => {
    console.log(` Server running → http://localhost:${PORT}`);
  });
});