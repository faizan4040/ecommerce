/*
 * KMF Shoes – real-time chat server (Socket.IO)
 * ---------------------------------------------
 * Runs on its own (e.g. on Render), separate from the Next.js app.
 *
 * Security: the browser connects with a short-lived token from the Next.js
 * endpoint /api/chat/token (signed with SECRET_KEY). Who is sending a message
 * is ALWAYS taken from that token – never from the message payload.
 *
 * Channels:
 *   "admins"        – every connected admin (receives every conversation)
 *   "user:<userId>" – all tabs/devices of one customer
 */
import { fileURLToPath } from "node:url"
import path from "node:path"
import { createServer } from "node:http"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { Server } from "socket.io"
import { jwtVerify } from "jose"
import { ChatRoom, Message } from "./models.js"

const here = path.dirname(fileURLToPath(import.meta.url))
// socket-server/.env first (production), then the Next app's .env.local (local dev)
dotenv.config({ path: [path.join(here, ".env"), path.join(here, "..", ".env.local")], quiet: true })

const PORT = Number(process.env.PORT || process.env.SOCKET_PORT || 4000)
const SECRET = new TextEncoder().encode(process.env.SECRET_KEY || "")
const ORIGINS = (process.env.CLIENT_ORIGINS || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean)

const MAX_TEXT = 2000
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000 // a message can be edited for 24 hours

if (!process.env.MONGODB_URI || !process.env.SECRET_KEY) {
  console.error("❌ MONGODB_URI and SECRET_KEY must be set (see socket-server/.env.example)")
  process.exit(1)
}

await mongoose.connect(process.env.MONGODB_URI)
console.log("✅ MongoDB connected")

/* ------------------------------------------------------------------ */
/* HTTP server (health check for Render)                              */
/* ------------------------------------------------------------------ */
const httpServer = createServer((req, res) => {
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ ok: true, service: "chat-socket", online: online.size }))
    return
  }
  res.writeHead(404).end()
})

const io = new Server(httpServer, {
  cors: { origin: ORIGINS, methods: ["GET", "POST"], credentials: true },
  transports: ["websocket", "polling"],
  maxHttpBufferSize: 1e6,
})

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error("unauthorized"))
    const { payload } = await jwtVerify(token, SECRET)
    if (payload.typ !== "chat" || !payload.sub || !["user", "admin"].includes(payload.role)) {
      return next(new Error("unauthorized"))
    }
    socket.data.user = {
      id: String(payload.sub),
      role: payload.role,
      name: payload.name || (payload.role === "admin" ? "Support" : "Customer"),
      avatar: payload.avatar || "",
    }
    next()
  } catch {
    next(new Error("unauthorized"))
  }
})

/* ------------------------------------------------------------------ */
/* Presence                                                           */
/* ------------------------------------------------------------------ */
const online = new Map() // userId -> number of open sockets
const adminsOnline = () => (io.sockets.adapter.rooms.get("admins")?.size || 0) > 0

const toClient = (m) => ({
  _id: String(m._id),
  roomId: String(m.roomId),
  senderType: m.senderType,
  senderId: String(m.senderId),
  senderName: m.senderName,
  senderAvatar: m.senderAvatar,
  message: m.deletedAt ? "" : m.message,
  messageType: m.messageType,
  fileUrl: m.deletedAt ? null : m.fileUrl,
  fileName: m.deletedAt ? null : m.fileName,
  fileType: m.deletedAt ? null : m.fileType,
  isRead: m.isRead,
  edited: m.edited,
  deletedAt: m.deletedAt,
  createdAt: m.createdAt,
})

const roomSummary = (r) => ({
  _id: String(r._id),
  userId: String(r.userId),
  lastMessage: r.lastMessage,
  lastMessageAt: r.lastMessageAt,
  lastSenderType: r.lastSenderType,
  unreadForAdmin: r.unreadForAdmin,
  unreadForUser: r.unreadForUser,
})

// send an event to both sides of a conversation
const emitToRoom = (room, event, data) => {
  io.to("admins").to(`user:${room.userId}`).emit(event, data)
}

// a customer may only touch their own room; admins may touch any room
async function loadRoom(socket, roomId) {
  if (!mongoose.isValidObjectId(roomId)) return null
  const room = await ChatRoom.findById(roomId)
  if (!room) return null
  const me = socket.data.user
  if (me.role !== "admin" && String(room.userId) !== me.id) return null
  return room
}

const preview = (m) =>
  m.messageType === "image" ? "📷 Photo" : m.messageType === "file" ? `📎 ${m.fileName || "File"}` : m.message.slice(0, 120)

async function refreshLastMessage(room) {
  const last = await Message.findOne({ roomId: room._id, deletedAt: null }).sort({ createdAt: -1 })
  room.lastMessage = last ? preview(last) : ""
  room.lastMessageAt = last?.createdAt || room.lastMessageAt
  room.lastSenderType = last?.senderType || null
  await room.save()
}

/* ------------------------------------------------------------------ */
/* Connection                                                         */
/* ------------------------------------------------------------------ */
io.on("connection", (socket) => {
  const me = socket.data.user
  const wasAdminsOnline = adminsOnline()

  socket.join(me.role === "admin" ? "admins" : `user:${me.id}`)
  online.set(me.id, (online.get(me.id) || 0) + 1)

  if (me.role === "admin") {
    socket.emit("presence:list", [...online.keys()])
    if (!wasAdminsOnline) io.emit("support:status", { online: true })
  } else {
    io.to("admins").emit("presence", { userId: me.id, online: true })
  }
  socket.emit("support:status", { online: adminsOnline() })

  /* ---------- send ---------- */
  socket.on("message:send", async (data = {}, ack = () => {}) => {
    try {
      const room = await loadRoom(socket, data.roomId)
      if (!room) return ack({ ok: false, error: "Conversation not found." })

      const text = String(data.text || "").trim().slice(0, MAX_TEXT)
      const file = data.attachment && typeof data.attachment.url === "string" && /^https:\/\//.test(data.attachment.url)
        ? data.attachment
        : null
      if (!text && !file) return ack({ ok: false, error: "Message is empty." })

      const isImage = file && String(file.type || "").startsWith("image/")
      const msg = await Message.create({
        roomId: room._id,
        senderType: me.role,
        senderId: new mongoose.Types.ObjectId(me.id),
        senderName: me.name,
        senderAvatar: me.avatar,
        message: text,
        messageType: file ? (isImage ? "image" : "file") : "text",
        fileUrl: file?.url || null,
        fileName: file ? String(file.name || "file").slice(0, 120) : null,
        fileType: file ? String(file.type || "").slice(0, 80) : null,
      })

      room.lastMessage = preview(msg) || text
      room.lastMessageAt = msg.createdAt
      room.lastSenderType = me.role
      if (me.role === "admin") room.unreadForUser += 1
      else room.unreadForAdmin += 1
      await room.save()

      const out = { ...toClient(msg), tempId: data.tempId }
      emitToRoom(room, "message:new", out)
      emitToRoom(room, "room:update", roomSummary(room))
      ack({ ok: true, message: out })
    } catch (err) {
      console.error("message:send", err.message)
      ack({ ok: false, error: "Could not send the message. Please try again." })
    }
  })

  /* ---------- edit (sender only) ---------- */
  socket.on("message:edit", async ({ messageId, text } = {}, ack = () => {}) => {
    try {
      if (!mongoose.isValidObjectId(messageId)) return ack({ ok: false, error: "Message not found." })
      const msg = await Message.findById(messageId)
      if (!msg || msg.deletedAt) return ack({ ok: false, error: "Message not found." })
      if (String(msg.senderId) !== me.id || msg.senderType !== me.role) return ack({ ok: false, error: "You can only edit your own messages." })
      if (msg.messageType !== "text") return ack({ ok: false, error: "Only text messages can be edited." })
      if (Date.now() - new Date(msg.createdAt).getTime() > EDIT_WINDOW_MS) return ack({ ok: false, error: "This message is too old to edit." })
      const clean = String(text || "").trim().slice(0, MAX_TEXT)
      if (!clean) return ack({ ok: false, error: "Message can't be empty." })

      msg.message = clean
      msg.edited = true
      msg.editedAt = new Date()
      await msg.save()

      const room = await ChatRoom.findById(msg.roomId)
      if (room) {
        const latest = await Message.findOne({ roomId: room._id, deletedAt: null }).sort({ createdAt: -1 })
        if (latest && String(latest._id) === String(msg._id)) await refreshLastMessage(room)
        emitToRoom(room, "message:updated", toClient(msg))
        emitToRoom(room, "room:update", roomSummary(room))
      }
      ack({ ok: true })
    } catch (err) {
      console.error("message:edit", err.message)
      ack({ ok: false, error: "Could not edit the message." })
    }
  })

  /* ---------- delete (sender, or any admin) ---------- */
  socket.on("message:delete", async ({ messageId } = {}, ack = () => {}) => {
    try {
      if (!mongoose.isValidObjectId(messageId)) return ack({ ok: false, error: "Message not found." })
      const msg = await Message.findById(messageId)
      if (!msg || msg.deletedAt) return ack({ ok: false, error: "Message not found." })
      const isOwner = String(msg.senderId) === me.id && msg.senderType === me.role
      if (!isOwner && me.role !== "admin") return ack({ ok: false, error: "You can only delete your own messages." })

      msg.deletedAt = new Date()
      await msg.save()

      const room = await ChatRoom.findById(msg.roomId)
      if (room) {
        await refreshLastMessage(room)
        emitToRoom(room, "message:deleted", toClient(msg))
        emitToRoom(room, "room:update", roomSummary(room))
      }
      ack({ ok: true })
    } catch (err) {
      console.error("message:delete", err.message)
      ack({ ok: false, error: "Could not delete the message." })
    }
  })

  /* ---------- typing ---------- */
  // typing events are processed one after another so "stopped typing" can never overtake "typing"
  const roomOwner = new Map() // roomId -> customer userId (checked once per socket)
  let typingChain = Promise.resolve()
  socket.on("typing", ({ roomId, isTyping } = {}) => {
    typingChain = typingChain
      .then(async () => {
        let owner = roomOwner.get(roomId)
        if (!owner) {
          const room = await loadRoom(socket, roomId)
          if (!room) return
          owner = String(room.userId)
          roomOwner.set(roomId, owner)
        }
        const payload = { roomId: String(roomId), role: me.role, name: me.name, isTyping: !!isTyping }
        if (me.role === "admin") socket.to(`user:${owner}`).emit("typing", payload)
        else socket.to("admins").emit("typing", payload)
      })
      .catch(() => {})
  })

  /* ---------- read receipts ---------- */
  socket.on("room:read", async ({ roomId } = {}) => {
    try {
      const room = await loadRoom(socket, roomId)
      if (!room) return
      const otherSide = me.role === "admin" ? "user" : "admin"
      const res = await Message.updateMany({ roomId: room._id, senderType: otherSide, isRead: false }, { isRead: true })
      if (me.role === "admin") room.unreadForAdmin = 0
      else room.unreadForUser = 0
      await room.save()
      if (res.modifiedCount) emitToRoom(room, "room:read", { roomId: String(room._id), by: me.role })
      emitToRoom(room, "room:update", roomSummary(room))
    } catch (err) {
      console.error("room:read", err.message)
    }
  })

  /* ---------- delete whole conversation (admin) ---------- */
  socket.on("room:delete", async ({ roomId } = {}, ack = () => {}) => {
    try {
      if (me.role !== "admin") return ack({ ok: false, error: "Only admins can delete conversations." })
      const room = await loadRoom(socket, roomId)
      if (!room) return ack({ ok: false, error: "Conversation not found." })
      await Message.deleteMany({ roomId: room._id })
      await ChatRoom.deleteOne({ _id: room._id })
      emitToRoom(room, "room:deleted", { roomId: String(room._id) })
      ack({ ok: true })
    } catch (err) {
      console.error("room:delete", err.message)
      ack({ ok: false, error: "Could not delete the conversation." })
    }
  })

  /* ---------- disconnect ---------- */
  socket.on("disconnect", () => {
    const left = (online.get(me.id) || 1) - 1
    if (left <= 0) {
      online.delete(me.id)
      if (me.role === "admin") {
        if (!adminsOnline()) io.emit("support:status", { online: false })
      } else {
        io.to("admins").emit("presence", { userId: me.id, online: false })
      }
    } else {
      online.set(me.id, left)
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`💬 Chat socket server on http://localhost:${PORT}  (allowed origins: ${ORIGINS.join(", ")})`)
})
