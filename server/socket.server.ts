import { Server as SocketIo } from "socket.io";
import { Server as HttpServer } from "http";
import client from "../src/lib/redisClient";
let io: SocketIo; // Declare io variable globally bcoz const require value immediately

export function getIo(): SocketIo {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

const initializeSocket = (server: HttpServer): void => {
  io = new SocketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-room", async (roomId: string) => {
      socket.join(roomId);
      const chatHistory = await client.lRange(`room:${roomId}`,0,-1);
      if (chatHistory) {
        console.log(`Chat history for room ${roomId}:`, chatHistory);
        socket.emit("chat-history", chatHistory);
      }
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // ✅ Listen on the same socket
    socket.on("send-message", async ({ roomId, message }) => {
      console.log("Message received:", message);
      await client.rPush(`room:${roomId}`, `${message}`);
      await client.expire(`room:${roomId}`, 1000); 
      // forward to room
      socket.to(roomId).emit("receive-message", {
        message,
        at: Date.now(),
      });
    });
  });
};

export default initializeSocket;
