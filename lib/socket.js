import { io } from "socket.io-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const createSocket = ({ room, userId }) =>
  io(BASE_URL, {
    path: "/api/socket",
    query: { room, userId },
    transports: ["websocket"], // important
  });
