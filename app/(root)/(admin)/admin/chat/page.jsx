"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  CalendarDays,
  Inbox,
  Info,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  Trash2,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react"
import { connectSocket, emitAck, getSocket } from "@/lib/socket-client"
import { isMuted, playSound, setMuted } from "@/lib/chatSound"
import { showToast } from "@/lib/showToast"
import useConversation from "@/components/Chat/useConversation"
import { Avatar, Composer, MessageList, shortTime } from "@/components/Chat/ChatUI"

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "online", label: "Online" },
]

export default function AdminChat() {
  const [rooms, setRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const [online, setOnline] = useState(new Set())
  const [typingRooms, setTypingRooms] = useState({})
  const [connected, setConnected] = useState(false)
  const [me, setMe] = useState(null)
  const [muted, setMutedState] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const activeRef = useRef(null)
  activeRef.current = activeId

  const active = rooms.find((r) => r._id === activeId) || null
  const conv = useConversation(activeId, { me, active: !!activeId })

  const loadRooms = useCallback(async () => {
    try {
      const r = await fetch("/api/chat/rooms", { cache: "no-store" })
      const d = await r.json()
      if (d.success) setRooms(d.data.map((x) => ({ ...x, _id: String(x._id) })))
      else showToast("error", d.message)
    } catch (e) {
      showToast("error", e)
    } finally {
      setLoadingRooms(false)
    }
  }, [])

  /* ---------- socket ---------- */
  useEffect(() => {
    setMutedState(isMuted())
    loadRooms()
    const s = connectSocket()

    const onConnect = () => {
      setConnected(true)
      setMe(s.me || null)
    }
    const onDisconnect = () => setConnected(false)
    const onConnectError = () => setConnected(false)
    const onPresenceList = (ids) => setOnline(new Set(ids))
    const onPresence = ({ userId, online: on }) =>
      setOnline((prev) => {
        const next = new Set(prev)
        on ? next.add(userId) : next.delete(userId)
        return next
      })
    const onNew = (msg) => {
      if (msg.senderType === "user") playSound("incoming")
      setTypingRooms((t) => ({ ...t, [msg.roomId]: false }))
    }
    const onRoomUpdate = (summary) => {
      setRooms((prev) => {
        const i = prev.findIndex((r) => r._id === summary._id)
        if (i === -1) {
          loadRooms() // brand-new conversation – fetch it with the customer's details
          return prev
        }
        const next = [...prev]
        next[i] = {
          ...next[i],
          ...summary,
          unreadForAdmin: activeRef.current === summary._id ? 0 : summary.unreadForAdmin,
        }
        return next.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      })
    }
    const onRoomDeleted = ({ roomId }) => {
      setRooms((prev) => prev.filter((r) => r._id !== roomId))
      if (activeRef.current === roomId) setActiveId(null)
    }
    const onTyping = ({ roomId, isTyping, role }) => role === "user" && setTypingRooms((t) => ({ ...t, [roomId]: isTyping }))

    if (s.connected) onConnect()
    s.on("connect", onConnect)
    s.on("disconnect", onDisconnect)
    s.on("connect_error", onConnectError)
    s.on("presence:list", onPresenceList)
    s.on("presence", onPresence)
    s.on("message:new", onNew)
    s.on("room:update", onRoomUpdate)
    s.on("room:deleted", onRoomDeleted)
    s.on("typing", onTyping)
    return () => {
      s.off("connect", onConnect)
      s.off("disconnect", onDisconnect)
      s.off("connect_error", onConnectError)
      s.off("presence:list", onPresenceList)
      s.off("presence", onPresence)
      s.off("message:new", onNew)
      s.off("room:update", onRoomUpdate)
      s.off("room:deleted", onRoomDeleted)
      s.off("typing", onTyping)
    }
  }, [loadRooms])

  const openRoom = (id) => {
    setActiveId(id)
    setConfirmDelete(false)
    setRooms((prev) => prev.map((r) => (r._id === id ? { ...r, unreadForAdmin: 0 } : r)))
  }

  const deleteConversation = async () => {
    const res = await emitAck("room:delete", { roomId: activeId })
    setConfirmDelete(false)
    if (res.ok) showToast("success", "Conversation deleted.")
    else showToast("error", res.error)
  }

  /* ---------- filtering ---------- */
  const totalUnread = rooms.reduce((n, r) => n + (r.unreadForAdmin || 0), 0)
  const onlineCustomers = rooms.filter((r) => online.has(String(r.userId))).length
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rooms.filter((r) => {
      if (tab === "unread" && !r.unreadForAdmin) return false
      if (tab === "online" && !online.has(String(r.userId))) return false
      if (!q) return true
      return [r.user?.name, r.user?.email, r.lastMessage].some((v) => v?.toLowerCase().includes(q))
    })
  }, [rooms, search, tab, online])

  const customer = active?.user
  const customerOnline = active ? online.has(String(active.userId)) : false
  const peer = { name: customer?.name || "Customer", avatar: customer?.avatar?.url || "" }

  return (
    <div className="py-4">
      <div className="relative flex h-[calc(100vh-7.5rem)] min-h-[560px] overflow-hidden rounded-3xl border bg-card shadow-sm">
        {/* ================= CONVERSATIONS ================= */}
        <aside className={`flex w-full flex-col border-r md:w-[340px] md:shrink-0 ${activeId ? "hidden md:flex" : "flex"}`}>
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Messages</h1>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
                  {connected ? `${onlineCustomers} customer${onlineCustomers === 1 ? "" : "s"} online` : "Offline – reconnecting"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {totalUnread > 0 && (
                  <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">{totalUnread} new</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMuted(!muted)
                    setMutedState(!muted)
                  }}
                  title={muted ? "Unmute sounds" : "Mute sounds"}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-muted px-3 focus-within:ring-2 focus-within:ring-orange-500/40">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or message"
                className="h-full flex-1 bg-transparent text-sm outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground cursor-pointer" aria-label="Clear">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`relative rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab === t.key && <motion.span layoutId="chat-tab" className="absolute inset-0 rounded-lg bg-background shadow-sm" />}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 chat-scroll">
            {loadingRooms ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 opacity-40" />
                <p className="mt-3 text-sm font-semibold">{rooms.length ? "No conversations match" : "No conversations yet"}</p>
                <p className="mt-1 text-xs">Customer messages will appear here in real time.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((r) => {
                  const isActive = r._id === activeId
                  const isOnline = online.has(String(r.userId))
                  const typing = typingRooms[r._id]
                  return (
                    <motion.button
                      layout
                      key={r._id}
                      type="button"
                      onClick={() => openRoom(r._id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition cursor-pointer ${isActive ? "bg-orange-50 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:ring-orange-500/30" : "hover:bg-muted"}`}
                    >
                      <Avatar src={r.user?.avatar?.url} name={r.user?.name || "Customer"} size={44} online={isOnline} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate text-sm ${r.unreadForAdmin ? "font-extrabold" : "font-semibold"}`}>{r.user?.name || "Deleted user"}</p>
                          <span className={`shrink-0 text-[11px] ${r.unreadForAdmin ? "font-bold text-orange-600" : "text-muted-foreground"}`}>{shortTime(r.lastMessageAt)}</span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className={`truncate text-xs ${typing ? "font-semibold text-orange-500" : r.unreadForAdmin ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {typing ? "typing…" : r.lastMessage ? `${r.lastSenderType === "admin" ? "You: " : ""}${r.lastMessage}` : "No messages yet"}
                          </p>
                          {r.unreadForAdmin > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
                              {r.unreadForAdmin > 99 ? "99+" : r.unreadForAdmin}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </aside>

        {/* ================= CONVERSATION ================= */}
        <section className={`min-w-0 flex-1 flex-col bg-[#f6f6f4] dark:bg-background ${activeId ? "flex" : "hidden md:flex"}`}>
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-orange-500 dark:bg-orange-500/15">
                <MessageSquareText className="h-9 w-9" />
              </span>
              <p className="mt-5 text-xl font-extrabold">Select a conversation</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Pick a customer on the left to read and reply. New messages arrive instantly with a sound.</p>
            </div>
          ) : (
            <>
              {/* header */}
              <header className="relative flex items-center gap-3 border-b bg-card px-3 py-3 sm:px-4">
                <button type="button" onClick={() => setActiveId(null)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted md:hidden cursor-pointer" aria-label="Back">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar src={peer.avatar} name={peer.name} size={42} online={customerOnline} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{peer.name}</p>
                  <p className={`text-xs ${conv.otherTyping ? "font-semibold text-orange-500" : "text-muted-foreground"}`}>
                    {!connected ? (
                      <span className="inline-flex items-center gap-1"><WifiOff className="h-3 w-3" /> Reconnecting…</span>
                    ) : conv.otherTyping ? "typing…" : customerOnline ? "Online now" : "Offline"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInfo((v) => !v)}
                  className={`hidden h-9 w-9 items-center justify-center rounded-full transition xl:flex cursor-pointer ${showInfo ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  title="Customer info"
                >
                  <Info className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  title="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {confirmDelete && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="absolute right-3 top-full z-30 mt-2 w-72 rounded-2xl bg-card p-4 shadow-2xl ring-1 ring-black/10"
                    >
                      <p className="font-bold">Delete this conversation?</p>
                      <p className="mt-1 text-sm text-muted-foreground">All messages with {peer.name} will be permanently removed for both of you.</p>
                      <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-muted cursor-pointer">Cancel</button>
                        <button type="button" onClick={deleteConversation} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 cursor-pointer">Delete</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </header>

              <MessageList
                conv={conv}
                me={me}
                peer={peer}
                canModerate
                emptyState={
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <Avatar src={peer.avatar} name={peer.name} size={56} />
                    <p className="mt-3 text-sm font-semibold text-foreground">Start the conversation with {peer.name}</p>
                    <p className="text-xs">Say hello 👋</p>
                  </div>
                }
              />
              <Composer conv={conv} disabled={!connected} placeholder={`Reply to ${peer.name.split(" ")[0]}…`} />
            </>
          )}
        </section>

        {/* ================= CUSTOMER INFO ================= */}
        <AnimatePresence initial={false}>
          {active && showInfo && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden shrink-0 overflow-hidden border-l bg-card xl:block"
            >
              <div className="w-[300px] p-5">
                <div className="flex flex-col items-center text-center">
                  <Avatar src={peer.avatar} name={peer.name} size={84} online={customerOnline} />
                  <p className="mt-3 text-lg font-extrabold">{peer.name}</p>
                  <span className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${customerOnline ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15" : "bg-muted text-muted-foreground"}`}>
                    {customerOnline ? "● Online" : "Offline"}
                  </span>
                </div>
                <dl className="mt-6 space-y-3 text-sm">
                  {[
                    [Mail, "Email", customer?.email],
                    [Phone, "Phone", customer?.phone],
                    [CalendarDays, "Customer since", customer?.createdAt && new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
                    [MessageSquareText, "Chat started", active?.createdAt && new Date(active.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
                  ]
                    .filter(([, , v]) => v)
                    .map(([Icon, label, value]) => (
                      <div key={label} className="flex items-start gap-3 rounded-2xl bg-muted/60 p-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <div className="min-w-0">
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
                          <dd className="break-words font-medium">{value}</dd>
                        </div>
                      </div>
                    ))}
                </dl>
                {customer?.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition hover:border-orange-500 hover:text-orange-600"
                  >
                    <Mail className="h-4 w-4" /> Send email
                  </a>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {!connected && !loadingRooms && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting to chat server…
          </div>
        )}
      </div>
    </div>
  )
}
