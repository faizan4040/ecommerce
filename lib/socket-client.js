import { io } from "socket.io-client";

let socket = null;
let currentRoomId = null;

/* ===============================
   CREATE / GET SOCKET INSTANCE
   =============================== */
export const createSocket = ({ roomId } = {}) => {
  // Create socket only once
  if (!socket) {
    socket = io({
      path: "/api/socket",
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);

      // Auto-join last known room after refresh / reconnect
      if (currentRoomId) {
        socket.emit("join-room", currentRoomId);
        console.log("↩️ Rejoined room:", currentRoomId);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socket.on("connect_error", err => {
      console.error("❌ Socket error:", err.message);
    });
  }

  // Handle room join / switch
  if (roomId && roomId !== currentRoomId) {
    if (currentRoomId) {
      socket.emit("leave-room", currentRoomId); // optional but clean
      console.log("🚪 Left room:", currentRoomId);
    }

    socket.emit("join-room", roomId);
    currentRoomId = roomId;
    console.log("📦 Joined room:", roomId);
  }

  return socket;
};

/* ===============================
   LEAVE CURRENT ROOM ONLY
   =============================== */
export const leaveRoom = () => {
  if (socket && currentRoomId) {
    socket.emit("leave-room", currentRoomId);
    console.log("🚪 Left room:", currentRoomId);
    currentRoomId = null;
  }
};

/* ===============================
   FULL CLEANUP (LOGOUT / APP EXIT)
   =============================== */
export const disconnectSocket = () => {
  if (socket) {
    if (currentRoomId) {
      socket.emit("leave-room", currentRoomId);
      currentRoomId = null;
    }

    socket.removeAllListeners();
    socket.disconnect();
    socket = null;

    console.log("🧹 Socket fully cleaned");
  }
};