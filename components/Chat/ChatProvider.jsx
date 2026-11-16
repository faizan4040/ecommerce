"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket-client"
import { playSound } from "@/lib/chatSound"

const ChatContext = createContext(null)

/**
 * Website chat state (customers). Admins use the dashboard chat page instead.
 * `user` = auth object from redux (null when logged out).
 */
export function ChatProvider({ children, user }) {
  const isCustomer = !!user?._id && user.role !== "admin"
  const [open, setOpen] = useState(false)
  const [room, setRoom] = useState(null)
  const [unread, setUnread] = useState(0)
  const [connected, setConnected] = useState(false)
  const [supportOnline, setSupportOnline] = useState(false)
  const [me, setMe] = useState(null)
  const openRef = useRef(open)
  openRef.current = open

  /* ---------- connect / disconnect with login ---------- */
  useEffect(() => {
    if (!isCustomer) {
      // logged out → close the connection. (Admins keep theirs – the dashboard chat uses it.)
      if (!user?._id) disconnectSocket()
      setRoom(null)
      setUnread(0)
      setConnected(false)
      return
    }

    // existing conversation (unread badge even before opening)
    fetch("/api/chat/rooms", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setRoom(d.data)
          setUnread(d.data.unreadForUser || 0)
        }
      })
      .catch(() => {})

    const s = connectSocket()
    const onConnect = () => {
      setConnected(true)
      setMe(s.me || null)
    }
    const onDisconnect = () => setConnected(false)
    const onSupport = ({ online }) => setSupportOnline(!!online)
    const onNew = (msg) => {
      if (msg.senderType === "admin") {
        playSound("incoming")
        if (!openRef.current) setUnread((u) => u + 1)
      }
    }
    const onRoomUpdate = (r) => {
      setRoom((prev) => (prev && prev._id === r._id ? { ...prev, ...r } : prev || r))
      if (!openRef.current) setUnread(r.unreadForUser || 0)
    }
    const onRoomDeleted = () => {
      setRoom(null)
      setUnread(0)
    }

    if (s.connected) onConnect()
    s.on("connect", onConnect)
    s.on("disconnect", onDisconnect)
    s.on("support:status", onSupport)
    s.on("message:new", onNew)
    s.on("room:update", onRoomUpdate)
    s.on("room:deleted", onRoomDeleted)
    return () => {
      s.off("connect", onConnect)
      s.off("disconnect", onDisconnect)
      s.off("support:status", onSupport)
      s.off("message:new", onNew)
      s.off("room:update", onRoomUpdate)
      s.off("room:deleted", onRoomDeleted)
    }
  }, [isCustomer, user?._id])

  /* ---------- open: make sure the customer has a conversation ---------- */
  const ensureRoom = useCallback(async () => {
    if (!isCustomer || room) return room
    const r = await fetch("/api/chat/rooms", { method: "POST" })
    const d = await r.json().catch(() => ({}))
    if (d.success) setRoom(d.data)
    return d.data
  }, [isCustomer, room])

  const openChat = useCallback(() => {
    setOpen(true)
    setUnread(0)
    ensureRoom()
  }, [ensureRoom])

  const closeChat = useCallback(() => setOpen(false), [])

  return (
    <ChatContext.Provider
      value={{
        open,
        setOpen,
        openChat,
        closeChat,
        room,
        roomId: room?._id || null,
        unread,
        setUnread,
        connected,
        supportOnline,
        me: me || (user ? { _id: user._id, name: user.name, avatar: user.avatar?.url || "", role: user.role } : null),
        isLoggedIn: !!user?._id,
        isCustomer,
        socket: isCustomer ? getSocket() : null,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>")
  return ctx
}
