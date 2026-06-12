import { Server as SocketIo } from "socket.io";
import { Server as HttpServer } from "http";
import client from "./lib/redisClient.js";
let io: SocketIo; // Declare io variable globally bcoz const require value immediately

const PRIVATE_ROOM_TTL_SECONDS = 5 * 60;
const PUBLIC_ROOM_TTL_SECONDS = 5* 60;

export function getIo(): SocketIo {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

const initializeSocket = (server: HttpServer): void => {
  io = new SocketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    const anonyId = socket.handshake.auth.anonyId;
    console.log("anonyId", anonyId);
    socket.data.anonyId = anonyId;

    socket.on("join-room", async (roomId) => {
      const key = `room:${roomId}`;
      socket.join(roomId);
      const chatHistory = await client.lRange(`room:${roomId}`, 0, -1);
      if (chatHistory) {
        socket.emit("chat-history", chatHistory);
      }
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      const ttl = (await client.ttl(key)) as number;

      if (ttl > 0) {
        socket.emit("room-ttl", ttl);
      } else {
        socket.emit("room-ttl", ttl);
      }
    });

    // ✅ Listen on the same socket
    socket.on("send-message", async ({ roomId, message, msgId, seed }) => {
      const key = `room:${roomId}`;
      const msgObject = {
        message: message,
        id: socket.data.anonyId,
        msgId: msgId,
        seed: seed,
      };
      // Check if room exists
      const exists = await client.exists(key);
      await client.rPush(key, JSON.stringify(msgObject));

      // Only set expiry if room was just created
      if (!exists) {
        await client.expire(key, PRIVATE_ROOM_TTL_SECONDS);

        // Get TTL and broadcast to all users in room
        const ttl = await client.ttl(key);
        io.to(roomId).emit("room-ttl", ttl);
      }

      // forward to room
      socket.to(roomId).emit("receive-message", msgObject);
    });

    socket.on("delete-message", async ({ roomId, msgId }) => {
      console.log("listening to delete-message");

      const key = `room:${roomId}`;
      console.log("Delete request received for msgId:", msgId);
      // Get all messages from Redis
      const messages = await client.lRange(key, 0, -1);

      // Find the message index by ID
      for (let i = 0; i < messages.length; i++) {
        const msg = JSON.parse(messages[i] as string);
        console.log("msg.id", msg.msgId);

        if (msg.msgId === msgId) {
          // Step 1: Mark the element as deleted
          await client.lSet(key, i, "__deleted__");

          // Step 2: Remove the marker
          await client.lRem(key, 1, "__deleted__");

          // Notify other users in the room
          console.log("SERVER: emitting message-deleted", msgId);
          socket.to(roomId).emit("message-deleted", msgId);

          break;
        }
      }
    });

    socket.on("join-public-room", async (roomId) => {
      const key = `public-room:${roomId}`;
      const socketRoom = `public:${roomId}`;

      socket.join(socketRoom);

      const chatHistory = await client.lRange(key, 0, -1);
      socket.emit("public-chat-history", chatHistory);

      const ttl = (await client.ttl(key)) as number;
      if (ttl > 0) {
        socket.emit("public-room-ttl", ttl);
      }

      console.log(`Socket ${socket.id} joined public room ${roomId}`);
    });

    socket.on(
      "send-public-message",
      async ({ roomId, message, msgId, seed }) => {
        const key = `public-room:${roomId}`;
        const socketRoom = `public:${roomId}`;
        const msgObject = {
          message,
          id: socket.data.anonyId,
          msgId,
          seed,
        };

        const exists = await client.exists(key);
        await client.rPush(key, JSON.stringify(msgObject));

        if (!exists) {
          await client.expire(key, PUBLIC_ROOM_TTL_SECONDS);
          const ttl = await client.ttl(key);
          io.to(socketRoom).emit("public-room-ttl", ttl);
        }

        socket.to(socketRoom).emit("receive-public-message", msgObject);
      },
    );

    socket.on("delete-public-message", async ({ roomId, msgId }) => {
      const key = `public-room:${roomId}`;
      const socketRoom = `public:${roomId}`;
      const messages = await client.lRange(key, 0, -1);

      for (let i = 0; i < messages.length; i++) {
        const msg = JSON.parse(messages[i] as string);

        if (msg.msgId === msgId) {
          await client.lSet(key, i, "__deleted__");
          await client.lRem(key, 1, "__deleted__");
          socket.to(socketRoom).emit("public-message-deleted", msgId);
          break;
        }
      }
    });
  });
};

export default initializeSocket;
