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
    socket.on("send-message", async ({ roomId, message, msgId }) => {
      console.log("Message received:", message);
      const Msgobject = {
        message: message,
        id: socket.data.anonyId,
        msgId: msgId,
      };


      await client.rPush(`room:${roomId}`, JSON.stringify(Msgobject));
      await client.expire(`room:${roomId}`, 60 * 60);
      // forward to room
      socket.to(roomId).emit("receive-message", Msgobject);
    });

    socket.on("delete-message", async ({ roomId, msgId }) => {
        console.log("listening to delete-message");
        
        const key = `room:${roomId}`;
        console.log("Delete request received for msgId:", msgId);
        // Get all messages from Redis
        const messages = await client.lRange(key, 0, -1);

        // Find the message index by ID
        for (let i = 0; i < messages.length; i++) {
          const msg = JSON.parse(messages[i]);
          console.log("msg.id",msg.msgId);
          
          if (msg.msgId === msgId) {
            // Step 1: Mark the element as deleted
            await client.lSet(key, i, "__deleted__");

            // Step 2: Remove the marker
            await client.lRem(key, 1, "__deleted__");

            // Notify other users in the room
            console.log("SERVER: emitting message-deleted", msgId);
            socket.to(roomId).emit("message-deleted", msgId );

            break;
          }
        }
      });
  });
};

export default initializeSocket;
