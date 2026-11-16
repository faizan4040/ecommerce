// One Socket.IO connection per browser tab, authenticated with a short-lived chat token.
import { io } from "socket.io-client"

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"

let socket = null

async function fetchChatToken() {
  const res = await fetch("/api/chat/token", { credentials: "include", cache: "no-store" })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.success) throw new Error(json.message || "Please log in to use chat.")
  return json.data
}

/** Returns the (single) socket, connecting it if needed. `me` = { _id, name, avatar, role } from the token. */
export function getSocket() {
  if (socket) return socket
  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
    // a fresh token on every (re)connect
    auth: (cb) => {
      fetchChatToken()
        .then(({ token, user }) => {
          socket.me = user
          cb({ token })
        })
        .catch(() => cb({ token: "" }))
    },
  })
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected && !s.active) s.connect()
  return s
}

/** Promise-based emit with acknowledgement + timeout */
export function emitAck(event, payload, timeout = 10000) {
  const s = getSocket()
  return new Promise((resolve) => {
    if (!s.connected) return resolve({ ok: false, error: "Chat is offline. Reconnecting…" })
    s.timeout(timeout).emit(event, payload, (err, res) => {
      if (err) resolve({ ok: false, error: "The server didn't respond. Please try again." })
      else resolve(res || { ok: false, error: "Something went wrong." })
    })
  })
}

/** Call on logout */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
