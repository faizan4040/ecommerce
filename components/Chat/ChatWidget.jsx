"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Headphones, LogIn, MessageCircle, ShieldCheck, Volume2, VolumeX, WifiOff } from "lucide-react"
import { useChat } from "./ChatProvider"
import useConversation from "./useConversation"
import { Avatar, Composer, MessageList } from "./ChatUI"
import { isMuted, setMuted } from "@/lib/chatSound"
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute"

// header shows the logo; message bubbles use the admin's own photo, else "KS" initials
const SUPPORT = { name: "KMF Support", avatar: "" }
const SUPPORT_LOGO = "/assets/images/logo_kmf.png"
const QUICK = ["Where is my order?", "Help me choose a size", "Return / exchange", "Payment issue"]

export default function ChatWidget() {
  const { open, setOpen, openChat, roomId, unread, connected, supportOnline, me, isLoggedIn, isCustomer } = useChat()
  const [muted, setMutedState] = useState(false)
  useEffect(() => setMutedState(isMuted()), [])

  const conv = useConversation(isCustomer ? roomId : null, { me, active: open })

  // The website chat is for customers only – admins chat from their dashboard (/admin/chat)
  if (isLoggedIn && !isCustomer) return null

  return (
    <>
      {/* ---------- launcher ---------- */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={openChat}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            aria-label="Chat with us"
            className="chat-fab fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-[0_12px_30px_-8px_rgba(249,115,22,0.7)] cursor-pointer"
          >
            {unread > 0 && <span className="absolute inset-0 animate-ping rounded-full bg-orange-500/50" />}
            <MessageCircle className="relative h-6 w-6" />
            {unread > 0 && (
              <motion.span
                key={unread}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[11px] font-bold ring-2 ring-white"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---------- panel ---------- */}
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#f6f6f4] sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100vh-7rem))] sm:w-[390px] sm:rounded-[28px] sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] sm:ring-1 sm:ring-black/10"
          >
            {/* header */}
            <header className="relative overflow-hidden bg-neutral-950 px-4 pb-4 pt-4 text-white">
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-orange-500/40 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <span className="relative">
                  <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={SUPPORT_LOGO} alt="" className="h-full w-full object-contain" />
                  </span>
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-neutral-950 ${supportOnline ? "bg-emerald-400" : "bg-neutral-500"}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{SUPPORT.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-white/60">
                    {!isLoggedIn ? (
                      "We usually reply in a few minutes"
                    ) : !connected ? (
                      <>
                        <WifiOff className="h-3 w-3" /> Connecting…
                      </>
                    ) : conv.otherTyping ? (
                      <span className="text-orange-300">typing…</span>
                    ) : supportOnline ? (
                      "Online · replies in minutes"
                    ) : (
                      "Away · we'll reply soon"
                    )}
                  </p>
                </div>
                {isCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      setMuted(!muted)
                      setMutedState(!muted)
                    }}
                    title={muted ? "Unmute sounds" : "Mute sounds"}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </header>

            {!isLoggedIn ? (
              /* ---------- logged out ---------- */
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-orange-500"
                >
                  <Headphones className="h-9 w-9" />
                </motion.span>
                <p className="mt-5 text-xl font-extrabold">Need help? Chat with us</p>
                <p className="mt-1.5 text-sm text-neutral-500">Log in so we can see your orders and keep your conversation safe.</p>
                <Link
                  href={WEBSITE_LOGIN}
                  onClick={() => setOpen(false)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
                >
                  <LogIn className="h-4 w-4" /> Log in to chat
                </Link>
              </div>
            ) : (
              <>
                <MessageList
                  conv={conv}
                  me={me}
                  peer={SUPPORT}
                  emptyState={
                    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                      <Avatar src={me?.avatar} name={me?.name || ""} size={56} ring />
                      <p className="mt-4 text-lg font-extrabold">Hi {me?.name?.split(" ")[0] || "there"} 👋</p>
                      <p className="mt-1 text-sm text-neutral-500">How can we help you today? Pick a topic or type your question.</p>
                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {QUICK.map((q) => (
                          <button
                            key={q}
                            type="button"
                            disabled={!roomId || !connected}
                            onClick={() => conv.send(q)}
                            className="rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:text-orange-600 hover:ring-orange-400 disabled:opacity-50 cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                      <p className="mt-6 flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> Your chat is private and secure
                      </p>
                    </div>
                  }
                />
                <Composer conv={conv} disabled={!roomId || !connected} />
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
