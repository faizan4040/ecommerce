'use client'

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock3,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  RotateCcw,
  SendHorizontal,
  Smile,
  Trash2,
  X,
} from "lucide-react"
import axios from "axios"
import { showToast } from "@/lib/showToast"

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */
const timeOf = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
const dayKey = (d) => new Date(d).toDateString()
export function dayLabel(d) {
  const date = new Date(d)
  const today = new Date()
  const yest = new Date()
  yest.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yest.toDateString()) return "Yesterday"
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" })
}
export function shortTime(d) {
  if (!d) return ""
  const date = new Date(d)
  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return "now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (date.toDateString() === new Date().toDateString()) return timeOf(date)
  if (diff < 7 * 86_400_000) return date.toLocaleDateString("en-IN", { weekday: "short" })
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000
const COLORS = ["bg-orange-500", "bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-rose-500", "bg-amber-500", "bg-teal-500"]

/* ------------------------------------------------------------------ */
/* Avatar                                                             */
/* ------------------------------------------------------------------ */
export function Avatar({ src, name = "", size = 36, online, ring = false, className = "" }) {
  const [broken, setBroken] = useState(false)
  const initials = name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"
  const color = COLORS[(name.length + (name.charCodeAt(0) || 0)) % COLORS.length]
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setBroken(true)}
          className={`h-full w-full rounded-full object-cover ${ring ? "ring-2 ring-white" : ""}`}
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center rounded-full font-bold text-white ${color} ${ring ? "ring-2 ring-white" : ""}`}
          style={{ fontSize: size * 0.38 }}
        >
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${online ? "bg-emerald-500" : "bg-neutral-300"}`}
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Typing dots                                                        */
/* ------------------------------------------------------------------ */
export function TypingBubble({ name, avatar }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex items-end gap-2">
      <Avatar src={avatar} name={name || ""} size={28} />
      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-neutral-400"
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </span>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Message list                                                       */
/* ------------------------------------------------------------------ */
export function MessageList({ conv, me, peer, emptyState, canModerate = false, className = "" }) {
  const box = useRef(null)
  const lastLen = useRef(0)
  const restoreFrom = useRef(0) // scrollHeight before older messages were loaded
  const [viewer, setViewer] = useState(null)
  const { messages, loading, hasMore, loadingOlder, loadOlder, otherTyping } = conv

  // older messages prepended → keep the reader where they were; new message → stick to bottom
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    if (restoreFrom.current && messages.length > lastLen.current) {
      el.scrollTop = el.scrollHeight - restoreFrom.current
      restoreFrom.current = 0
    } else if (messages.length !== lastLen.current) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200
      const lastMine = messages[messages.length - 1]?.senderType === me?.role
      if (lastLen.current === 0) el.scrollTop = el.scrollHeight
      else if (nearBottom || lastMine) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    }
    lastLen.current = messages.length
  }, [messages, me?.role])

  // reset when switching conversations
  useEffect(() => {
    if (loading) lastLen.current = 0
  }, [loading])

  useEffect(() => {
    const el = box.current
    if (el && otherTyping) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
      if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    }
  }, [otherTyping])

  const onScroll = (e) => {
    const el = e.currentTarget
    if (el.scrollTop < 60 && hasMore && !loadingOlder) {
      restoreFrom.current = el.scrollHeight
      loadOlder()
    }
  }

  return (
    <div ref={box} onScroll={onScroll} className={`chat-scroll flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 ${className}`}>
      {loading ? (
        <div className="space-y-4 p-2">
          {[60, 40, 70, 50].map((w, i) => (
            <div key={i} className={`flex ${i % 2 ? "justify-end" : ""}`}>
              <div className="h-10 animate-pulse rounded-2xl bg-neutral-200/70" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        emptyState
      ) : (
        <>
          {loadingOlder && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          )}
          {messages.map((m, i) => {
            const prev = messages[i - 1]
            const next = messages[i + 1]
            const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt)
            const mine = m.senderType === me?.role
            const groupedWithNext = next && next.senderType === m.senderType && dayKey(next.createdAt) === dayKey(m.createdAt) && new Date(next.createdAt) - new Date(m.createdAt) < 5 * 60_000
            const groupedWithPrev = prev && !newDay && prev.senderType === m.senderType && new Date(m.createdAt) - new Date(prev.createdAt) < 5 * 60_000
            return (
              <Fragment key={m._id || m.tempId}>
                {newDay && (
                  <div className="my-4 flex items-center justify-center">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-neutral-500 shadow-sm ring-1 ring-black/5 backdrop-blur">
                      {dayLabel(m.createdAt)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  m={m}
                  mine={mine}
                  showAvatar={!mine && !groupedWithNext}
                  tight={groupedWithPrev}
                  peer={peer}
                  conv={conv}
                  canModerate={canModerate}
                  onImage={setViewer}
                />
              </Fragment>
            )
          })}
        </>
      )}
      <AnimatePresence>{otherTyping && <div className="mt-3"><TypingBubble name={peer?.name || otherTyping} avatar={peer?.avatar} /></div>}</AnimatePresence>

      <AnimatePresence>
        {viewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewer(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          >
            <button type="button" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={viewer} alt="" className="max-h-[88vh] max-w-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* One message                                                        */
/* ------------------------------------------------------------------ */
function MessageBubble({ m, mine, showAvatar, tight, peer, conv, canModerate, onImage }) {
  const [menu, setMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(m.message)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleted = !!m.deletedAt
  const canEdit = mine && !deleted && m._id && m.messageType === "text" && Date.now() - new Date(m.createdAt).getTime() < EDIT_WINDOW_MS
  const canDelete = !deleted && m._id && (mine || canModerate)

  useEffect(() => setDraft(m.message), [m.message])

  const saveEdit = async () => {
    const t = draft.trim()
    if (!t || t === m.message) return setEditing(false)
    const ok = await conv.edit(m._id, t)
    if (ok) setEditing(false)
  }

  const bubbleBase = mine
    ? "bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
    : "bg-white text-neutral-800 shadow-sm ring-1 ring-black/5"
  const shape = mine ? `rounded-2xl ${tight ? "rounded-tr-md" : ""} rounded-br-md` : `rounded-2xl ${tight ? "rounded-tl-md" : ""} rounded-bl-md`

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className={`group flex items-end gap-2 ${mine ? "justify-end" : ""} ${tight ? "mt-1" : "mt-3"}`}
    >
      {!mine && (showAvatar ? <Avatar src={m.senderAvatar || peer?.avatar} name={m.senderName || peer?.name || ""} size={28} /> : <span className="w-7 shrink-0" />)}

      {/* actions (left of my bubble) */}
      {mine && (canEdit || canDelete) && !editing && (
        <ActionMenu open={menu} setOpen={setMenu} canEdit={canEdit} canDelete={canDelete} onEdit={() => setEditing(true)} onDelete={() => setConfirmDelete(true)} align="right" />
      )}

      <div className={`relative max-w-[78%] sm:max-w-[70%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
        {deleted ? (
          <div className={`${shape} border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-2 text-[13px] italic text-neutral-400`}>
            🚫 This message was deleted
          </div>
        ) : editing ? (
          <div className="w-64 rounded-2xl bg-white p-2 shadow-lg ring-2 ring-orange-500 sm:w-72">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  saveEdit()
                }
                if (e.key === "Escape") setEditing(false)
              }}
              rows={2}
              maxLength={2000}
              className="w-full resize-none bg-transparent p-1.5 text-sm text-neutral-800 outline-none"
            />
            <div className="flex justify-end gap-1.5">
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 cursor-pointer">Cancel</button>
              <button type="button" onClick={saveEdit} className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 cursor-pointer">Save</button>
            </div>
          </div>
        ) : (
          <div className={`${shape} ${bubbleBase} ${m.pending ? "opacity-70" : ""} ${m.failed ? "ring-2 ring-red-400" : ""} overflow-hidden`}>
            {m.messageType === "image" && m.fileUrl && (
              <button type="button" onClick={() => onImage(m.fileUrl)} className="block cursor-zoom-in p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.fileUrl} alt={m.fileName || "image"} className="max-h-64 w-full max-w-[260px] rounded-xl object-cover" />
              </button>
            )}
            {m.messageType === "file" && m.fileUrl && (
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`m-1 flex items-center gap-3 rounded-xl p-2.5 ${mine ? "bg-white/15 hover:bg-white/25" : "bg-neutral-100 hover:bg-neutral-200"}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${mine ? "bg-white/20" : "bg-white"}`}>
                  <FileText className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.fileName || "File"}</span>
                <Download className="h-4 w-4 shrink-0 opacity-70" />
              </a>
            )}
            {m.message && (
              <p className="whitespace-pre-wrap break-words px-3.5 py-2 text-[14px] leading-relaxed">{m.message}</p>
            )}
          </div>
        )}

        {/* meta */}
        {!editing && (
          <div className={`mt-1 flex items-center gap-1 px-1 text-[10.5px] text-neutral-400 ${mine ? "justify-end" : ""}`}>
            {m.edited && !deleted && <span className="italic">edited ·</span>}
            <span>{timeOf(m.createdAt)}</span>
            {mine && !deleted && (
              m.failed ? (
                <button type="button" onClick={() => conv.retry(m.tempId)} className="ml-1 inline-flex items-center gap-1 font-semibold text-red-500 hover:underline cursor-pointer">
                  <AlertCircle className="h-3 w-3" /> Failed · Retry <RotateCcw className="h-3 w-3" />
                </button>
              ) : m.pending ? (
                <Clock3 className="h-3 w-3" />
              ) : m.isRead ? (
                <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )
            )}
          </div>
        )}

        {/* delete confirm */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute bottom-full z-20 mb-2 w-56 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/10 ${mine ? "right-0" : "left-0"}`}
            >
              <p className="text-sm font-semibold text-neutral-800">Delete this message?</p>
              <p className="mt-0.5 text-xs text-neutral-500">It will be removed for everyone.</p>
              <div className="mt-3 flex justify-end gap-1.5">
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer">Cancel</button>
                <button
                  type="button"
                  onClick={async () => {
                    setConfirmDelete(false)
                    await conv.remove(m._id)
                  }}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!mine && canDelete && !editing && (
        <ActionMenu open={menu} setOpen={setMenu} canEdit={false} canDelete onDelete={() => setConfirmDelete(true)} align="left" />
      )}
    </motion.div>
  )
}

function ActionMenu({ open, setOpen, canEdit, canDelete, onEdit, onDelete, align }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [open, setOpen])
  return (
    <div ref={ref} className="relative mb-6 self-center opacity-0 transition group-hover:opacity-100 has-[button[data-open=true]]:opacity-100">
      <button
        type="button"
        data-open={open}
        onClick={() => setOpen((o) => !o)}
        aria-label="Message options"
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200/70 hover:text-neutral-700 cursor-pointer"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className={`absolute bottom-full z-20 mb-1 w-36 overflow-hidden rounded-xl bg-white p-1 shadow-xl ring-1 ring-black/10 ${align === "right" ? "right-0" : "left-0"}`}
          >
            {canEdit && (
              <button type="button" onClick={() => { setOpen(false); onEdit() }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            {canDelete && (
              <button type="button" onClick={() => { setOpen(false); onDelete() }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Composer                                                           */
/* ------------------------------------------------------------------ */
const EMOJIS = ["😀", "😂", "😍", "🥰", "😎", "🤔", "😢", "😡", "👍", "👎", "🙏", "👏", "🔥", "🎉", "❤️", "✅", "👟", "📦", "🚚", "💯"]
const MAX_FILE = 5 * 1024 * 1024
const FILE_TYPES = "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx"

export function Composer({ conv, disabled, placeholder = "Type a message…" }) {
  const [text, setText] = useState("")
  const [emoji, setEmoji] = useState(false)
  const [file, setFile] = useState(null) // { file, preview, progress, uploaded }
  const ta = useRef(null)
  const fileInput = useRef(null)
  const typingTimeout = useRef(null)

  // auto-grow
  useEffect(() => {
    const el = ta.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }, [text])

  const onChange = (v) => {
    setText(v)
    conv.setTyping(!!v.trim())
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => conv.setTyping(false), 2000)
  }

  const pickFile = (f) => {
    if (!f) return
    if (f.size > MAX_FILE) return showToast("error", "File is too large. Maximum size is 5 MB.")
    setFile({ file: f, preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null, progress: 0 })
  }

  const submit = async () => {
    if (disabled) return
    let attachment = null
    if (file) {
      try {
        const form = new FormData()
        form.append("file", file.file)
        const { data } = await axios.post("/api/chat/upload", form, {
          onUploadProgress: (e) => e.total && setFile((f) => f && { ...f, progress: Math.round((e.loaded / e.total) * 100) }),
        })
        if (!data.success) throw new Error(data.message)
        attachment = { url: data.fileUrl, name: data.fileName, type: data.fileType }
      } catch (err) {
        return showToast("error", err)
      }
    }
    if (!text.trim() && !attachment) return
    conv.send(text, attachment)
    setText("")
    if (file?.preview) URL.revokeObjectURL(file.preview)
    setFile(null)
    setEmoji(false)
    ta.current?.focus()
  }

  const uploading = file && file.progress > 0 && file.progress < 100

  return (
    <div className="relative border-t border-neutral-200/70 bg-white p-2.5 sm:p-3">
      {/* attachment preview */}
      <AnimatePresence>
        {file && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mb-2 flex items-center gap-3 rounded-2xl bg-neutral-50 p-2 ring-1 ring-black/5">
              {file.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.preview} alt="" className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white ring-1 ring-black/5"><FileText className="h-5 w-5 text-orange-500" /></span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file.file.name}</p>
                {uploading ? (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200"><div className="h-full bg-orange-500 transition-all" style={{ width: `${file.progress}%` }} /></div>
                ) : (
                  <p className="text-xs text-neutral-400">{(file.file.size / 1024).toFixed(0)} KB</p>
                )}
              </div>
              <button type="button" onClick={() => setFile(null)} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 cursor-pointer" aria-label="Remove file">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* emoji picker */}
      <AnimatePresence>
        {emoji && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="absolute bottom-full left-2.5 z-20 mb-2 grid grid-cols-10 gap-0.5 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/10"
          >
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => onChange(text + e)} className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:scale-125 hover:bg-neutral-100 cursor-pointer">
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1.5 rounded-2xl bg-neutral-100 p-1.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/40">
        <button type="button" onClick={() => setEmoji((v) => !v)} disabled={disabled} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:bg-white cursor-pointer disabled:opacity-40 ${emoji ? "text-orange-500" : "text-neutral-500"}`} aria-label="Emoji">
          <Smile className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} disabled={disabled} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-white hover:text-neutral-800 cursor-pointer disabled:opacity-40" aria-label="Attach file">
          <Paperclip className="h-5 w-5" />
        </button>
        <input ref={fileInput} type="file" accept={FILE_TYPES} hidden onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = "" }} />
        <textarea
          ref={ta}
          rows={1}
          value={text}
          disabled={disabled}
          maxLength={2000}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={disabled ? "Connecting…" : placeholder}
          className="max-h-[120px] min-h-9 flex-1 resize-none bg-transparent px-1.5 py-2 text-[14px] text-neutral-800 outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={submit}
          disabled={disabled || uploading || (!text.trim() && !file)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 disabled:bg-neutral-300 disabled:shadow-none cursor-pointer"
          aria-label="Send"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </motion.button>
      </div>
    </div>
  )
}
