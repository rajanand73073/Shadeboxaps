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
    const anonyId = socket.handshake.auth.anonyId;
    socket.data.anonyId = anonyId;

    socket.on("join-room", async (roomId: string) => {
      socket.join(roomId);

      const chatHistory = await client.lRange(`room:${roomId}`, 0, -1);
      if (chatHistory) {
        socket.emit("chat-history", chatHistory);
      }
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // ✅ Listen on the same socket
    socket.on("send-message", async ({ roomId, message }) => {
      console.log("Message received:", message);
      const Msgobject = {
        message: message,
        id: socket.data.anonyId,
      };

      await client.rPush(`room:${roomId}`, JSON.stringify(Msgobject));
      await client.expire(`room:${roomId}`, 60 * 60);
      // forward to room
      socket.to(roomId).emit("receive-message", Msgobject);
    });
  });
};

export default initializeSocket;
