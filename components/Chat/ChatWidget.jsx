// components/chat/ChatWidget.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle, X, Send, Paperclip,
  Loader2, CheckCheck, Check,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "./ChatProvider";
import { getSocket, joinRoom } from "@/lib/socket-client";

const TYPING_TIMEOUT = 1500;

export default function ChatWidget() {
  const { open, openChat, closeChat, roomId, userId, setUnread } = useChat();

  const messagesEndRef  = useRef(null);
  const typingTimer     = useRef(null);
  const inputRef        = useRef(null);

  const [message,        setMessage]        = useState("");
  const [messages,       setMessages]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [adminTyping,    setAdminTyping]     = useState(false);
  const [adminOnline,    setAdminOnline]     = useState(false);
  const [sending,        setSending]        = useState(false);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, adminTyping]);

  // ── Load history + attach socket listeners when room opens ────────────────
  useEffect(() => {
    if (!open || !roomId) return;

    const socket = getSocket();

    // Load history
    setLoading(true);
    fetch(`/api/chat/messages?roomId=${roomId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setMessages(d.data); })
      .finally(() => setLoading(false));

    // Join room
    joinRoom(roomId);

    // Mark messages as read
    socket.emit("mark-read", { roomId, readerType: "user" });

    // Receive message
    const onMessage = (msg) => {
      setMessages((prev) => {
        // Replace optimistic copy if server version arrives
        const exists = prev.findIndex(
          (m) => m._id && m._id === msg._id
        );
        if (exists !== -1) return prev;

        const optimisticIdx = prev.findIndex(
          (m) => !m._id && m.message === msg.message && m.senderType === msg.senderType
        );
        if (optimisticIdx !== -1) {
          const updated = [...prev];
          updated[optimisticIdx] = msg;
          return updated;
        }
        return [...prev, msg];
      });

      setAdminTyping(false);

      // Mark read immediately if chat is open
      if (msg.senderType === "admin") {
        socket.emit("mark-read", { roomId, readerType: "user" });
      }
    };

    // Typing
    const onTyping     = ({ senderType }) => { if (senderType === "admin") setAdminTyping(true);  };
    const onStopTyping = ({ senderType }) => { if (senderType === "admin") setAdminTyping(false); };

    // Presence
    const onPresence = ({ userId: uid, status }) => {
      // "admin" presence — we treat any admin online as available
      // In a real app, check against known adminId
      setAdminOnline(status === "online");
    };

    socket.on("receive-message",   onMessage);
    socket.on("user-typing",       onTyping);
    socket.on("user-stop-typing",  onStopTyping);
    socket.on("presence-update",   onPresence);

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 300);

    return () => {
      socket.off("receive-message",   onMessage);
      socket.off("user-typing",       onTyping);
      socket.off("user-stop-typing",  onStopTyping);
      socket.off("presence-update",   onPresence);
    };
  }, [open, roomId]);

  // ── Typing events ──────────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!roomId) return;

    const socket = getSocket();
    socket.emit("typing", { roomId, senderType: "user" });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop-typing", { roomId, senderType: "user" });
    }, TYPING_TIMEOUT);
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!message.trim() || !roomId || sending) return;

    const socket = getSocket();
    if (!socket?.connected) return;

    clearTimeout(typingTimer.current);
    socket.emit("stop-typing", { roomId, senderType: "user" });

    const optimistic = {
      roomId,
      senderType: "user",
      senderId:   userId,
      message:    message.trim(),
      createdAt:  new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    socket.emit("send-message", {
      roomId,
      senderType: "user",
      senderId:   userId,
      message:    message.trim(),
    });

    setMessage("");
    setSending(false);
  }, [message, roomId, userId, sending]);

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    const socket = getSocket();
    const msgData = {
      roomId,
      senderType: "user",
      senderId:   userId,
      message:    `📎 ${file.name}`,
    };
    setMessages((prev) => [...prev, msgData]);
    socket.emit("send-message", msgData);
    e.target.value = "";
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <>
      {/* ── Floating trigger ─────────────────────────────────────────────── */}
      <motion.button
        onClick={openChat}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
        aria-label="Open chat"
      >
        <MessageCircle size={24} className="text-white" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-blue-500" />
      </motion.button>

      {/* ── Chat window ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            style={{
              width:     "min(92vw, 380px)",
              maxHeight: "min(78vh, 580px)",
              background: "#ffffff",
              boxShadow: "0 25px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    S
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      adminOnline ? "bg-green-400" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm tracking-wide">
                    Support Team
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {adminOnline ? "● Online — replies instantly" : "○ Away — we'll reply soon"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ background: "#f8fafc", minHeight: 0 }}
            >
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                    style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}
                  >
                    <MessageCircle size={24} className="text-white" />
                  </div>
                  <p className="font-semibold text-gray-700 text-sm">How can we help?</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Send us a message and we'll respond shortly
                  </p>
                </div>
              )}

              {messages.map((msg, i) => {
                const isUser = msg.senderType === "user";
                return (
                  <motion.div
                    key={msg._id || `opt-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? "text-white rounded-br-sm"
                          : "text-gray-800 rounded-bl-sm shadow-sm"
                      }`}
                      style={
                        isUser
                          ? { background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }
                          : { background: "#ffffff", border: "1px solid #e8ecf0" }
                      }
                    >
                      {msg.message}
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-gray-400">
                        {formatTime(msg.createdAt)}
                      </span>
                      {isUser && (
                        msg._id
                          ? <CheckCheck size={11} className="text-blue-500" />
                          : <Check      size={11} className="text-gray-300" />
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing bubble */}
              <AnimatePresence>
                {adminTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{    opacity: 0, y: 6 }}
                    className="flex items-end gap-1"
                  >
                    <div
                      className="px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm"
                      style={{ background: "#ffffff", border: "1px solid #e8ecf0" }}
                    >
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gray-400"
                            style={{
                              animation: "bounce 1.2s infinite",
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-3 py-3 flex items-center gap-2 shrink-0"
              style={{ background: "#ffffff", borderTop: "1px solid #e8ecf0" }}
            >
              <label className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100">
                <Paperclip size={17} />
                <input type="file" hidden onChange={handleFile} />
              </label>

              <input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1 text-sm px-3 py-2 rounded-xl outline-none"
                style={{
                  background: "#f1f5f9",
                  border: "1px solid transparent",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0f3460")}
                onBlur={(e)  => (e.target.style.borderColor = "transparent")}
              />

              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0"
                style={{
                  background: message.trim()
                    ? "linear-gradient(135deg, #1a1a2e, #0f3460)"
                    : "#e2e8f0",
                }}
              >
                <Send
                  size={15}
                  className={message.trim() ? "text-white" : "text-gray-400"}
                />
              </button>
            </div>

            {/* Powered by */}
            <div
              className="text-center py-1.5 shrink-0"
              style={{ background: "#f8fafc", borderTop: "1px solid #e8ecf0" }}
            >
              <span className="text-[10px] text-gray-400 tracking-wide">
                Powered by <strong style={{ color: "#0f3460" }}>All Spikes</strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0);    }
          40%            { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
