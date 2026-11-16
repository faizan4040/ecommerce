'use client'

import { useCallback, useEffect, useRef, useState } from "react"
import { emitAck, getSocket } from "@/lib/socket-client"
import { playSound } from "@/lib/chatSound"
import { showToast } from "@/lib/showToast"

/**
 * Everything one conversation needs – shared by the website widget and the admin dashboard.
 *   const c = useConversation(roomId, { me, active })
 *   c.messages, c.loading, c.hasMore, c.loadOlder(), c.send(text, attachment), c.edit(id, text),
 *   c.remove(id), c.retry(tempId), c.setTyping(bool), c.otherTyping
 * `active` = the conversation is on screen (marks messages as read).
 */
export default function useConversation(roomId, { me, active = true } = {}) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [otherTyping, setOtherTyping] = useState(null) // name of the person typing
  const typingTimer = useRef(null)
  const iAmTyping = useRef(false)
  const roomRef = useRef(roomId)
  roomRef.current = roomId

  /* ---------- initial load ---------- */
  useEffect(() => {
    setMessages([])
    setHasMore(false)
    setOtherTyping(null)
    if (!roomId) return
    let off = false
    setLoading(true)
    fetch(`/api/chat/messages?roomId=${roomId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (off || !d.success) return
        setMessages(d.data.messages)
        setHasMore(d.data.hasMore)
      })
      .catch(() => {})
      .finally(() => !off && setLoading(false))
    return () => {
      off = true
    }
  }, [roomId])

  const markRead = useCallback(() => {
    if (roomRef.current) getSocket().emit("room:read", { roomId: roomRef.current })
  }, [])

  // mark as read whenever the conversation becomes visible
  useEffect(() => {
    if (active && roomId) markRead()
  }, [active, roomId, markRead])

  /* ---------- live events ---------- */
  useEffect(() => {
    if (!roomId) return
    const s = getSocket()

    const onNew = (msg) => {
      if (msg.roomId !== roomRef.current) return
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev
        const i = msg.tempId ? prev.findIndex((m) => m.tempId === msg.tempId) : -1
        if (i >= 0) {
          const next = [...prev]
          next[i] = msg
          return next
        }
        return [...prev, msg]
      })
      if (msg.senderType !== me?.role) {
        setOtherTyping(null)
        if (active) markRead()
      }
    }
    const onUpdated = (msg) => msg.roomId === roomRef.current && setMessages((p) => p.map((m) => (m._id === msg._id ? { ...m, ...msg } : m)))
    const onDeleted = (msg) =>
      msg.roomId === roomRef.current &&
      setMessages((p) => p.map((m) => (m._id === msg._id ? { ...m, ...msg, message: "", fileUrl: null, deletedAt: msg.deletedAt } : m)))
    const onRead = ({ roomId: r, by }) =>
      r === roomRef.current && by !== me?.role && setMessages((p) => p.map((m) => (m.senderType === me?.role ? { ...m, isRead: true } : m)))
    const onTyping = ({ roomId: r, isTyping, name }) => {
      if (r !== roomRef.current) return
      setOtherTyping(isTyping ? name || "Someone" : null)
      clearTimeout(typingTimer.current)
      if (isTyping) typingTimer.current = setTimeout(() => setOtherTyping(null), 6000)
    }

    s.on("message:new", onNew)
    s.on("message:updated", onUpdated)
    s.on("message:deleted", onDeleted)
    s.on("room:read", onRead)
    s.on("typing", onTyping)
    return () => {
      s.off("message:new", onNew)
      s.off("message:updated", onUpdated)
      s.off("message:deleted", onDeleted)
      s.off("room:read", onRead)
      s.off("typing", onTyping)
    }
  }, [roomId, me?.role, active, markRead])

  /* ---------- actions ---------- */
  const deliver = useCallback(
    async (tempId, text, attachment) => {
      const res = await emitAck("message:send", { roomId: roomRef.current, text, attachment, tempId })
      if (res.ok) {
        playSound("sent")
        setMessages((p) => {
          if (p.some((m) => m._id === res.message._id)) return p.filter((m) => m.tempId !== tempId || m._id)
          return p.map((m) => (m.tempId === tempId ? res.message : m))
        })
      } else {
        setMessages((p) => p.map((m) => (m.tempId === tempId ? { ...m, failed: true, pending: false } : m)))
        showToast("error", res.error)
      }
    },
    []
  )

  const send = useCallback(
    (text, attachment = null) => {
      const clean = String(text || "").trim()
      if (!roomRef.current || (!clean && !attachment)) return
      const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const isImage = attachment && String(attachment.type || "").startsWith("image/")
      setMessages((p) => [
        ...p,
        {
          tempId,
          pending: true,
          roomId: roomRef.current,
          senderType: me?.role,
          senderId: me?._id,
          senderName: me?.name,
          senderAvatar: me?.avatar,
          message: clean,
          messageType: attachment ? (isImage ? "image" : "file") : "text",
          fileUrl: attachment?.url || null,
          fileName: attachment?.name || null,
          fileType: attachment?.type || null,
          createdAt: new Date().toISOString(),
        },
      ])
      setTyping(false)
      deliver(tempId, clean, attachment)
    },
    [me, deliver] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const retry = useCallback(
    (tempId) => {
      const m = messages.find((x) => x.tempId === tempId)
      if (!m) return
      setMessages((p) => p.map((x) => (x.tempId === tempId ? { ...x, failed: false, pending: true } : x)))
      deliver(tempId, m.message, m.fileUrl ? { url: m.fileUrl, name: m.fileName, type: m.fileType } : null)
    },
    [messages, deliver]
  )

  const edit = useCallback(async (messageId, text) => {
    const res = await emitAck("message:edit", { messageId, text })
    if (!res.ok) showToast("error", res.error)
    return res.ok
  }, [])

  const remove = useCallback(async (messageId) => {
    const res = await emitAck("message:delete", { messageId })
    if (!res.ok) showToast("error", res.error)
    return res.ok
  }, [])

  const setTyping = useCallback((isTyping) => {
    if (!roomRef.current || iAmTyping.current === isTyping) return
    iAmTyping.current = isTyping
    getSocket().emit("typing", { roomId: roomRef.current, isTyping })
  }, [])

  const loadOlder = useCallback(async () => {
    const first = messages.find((m) => m._id)
    if (!first || loadingOlder || !hasMore) return
    setLoadingOlder(true)
    try {
      const r = await fetch(`/api/chat/messages?roomId=${roomRef.current}&before=${encodeURIComponent(first.createdAt)}`)
      const d = await r.json()
      if (d.success) {
        setMessages((p) => [...d.data.messages, ...p])
        setHasMore(d.data.hasMore)
      }
    } finally {
      setLoadingOlder(false)
    }
  }, [messages, loadingOlder, hasMore])

  return { messages, loading, hasMore, loadingOlder, loadOlder, otherTyping, send, retry, edit, remove, setTyping, markRead }
}
