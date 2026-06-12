import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../types/socket";
import { v4 as uuidv4 } from "uuid";
import { PRIVATE_ROOM_DURATION_MS } from "./privateRoom";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let connectedRoomId: string | null = null;

export interface identityKey {
  anonyId?: string;
  seed?: string;
  createdAt?: number;
  expiresAt?: number;
}

export const identity: identityKey = {};

export const getSocket = (roomId: string) => {
  if (socket && connectedRoomId !== roomId) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!socketUrl) {
      throw new Error("NEXT_PUBLIC_SOCKET_URL is not configured");
    }

    socket = io(socketUrl, {
      auth: {
        anonyId: anonymousId(roomId),
      },
    });
    connectedRoomId = roomId;
  }
  return socket;
};

export const anonymousId = (roomId: string): string => {
  const key = `anon:${roomId}`;
  const storedValue = localStorage.getItem(key);

  if (storedValue) {
    try {
      const parseData: identityKey = JSON.parse(storedValue);
      if (parseData.expiresAt && Date.now() >= parseData.expiresAt) {
        localStorage.removeItem(key);
      } else if (
        parseData.createdAt &&
        Date.now() - parseData.createdAt >= PRIVATE_ROOM_DURATION_MS
      ) {
        localStorage.removeItem(key);
      } else if (parseData.anonyId) {
        return parseData.anonyId;
      }
    } catch (e) {
      console.error("Corrupted localStorage found, clearing key:", key);
      console.error(e);
      localStorage.removeItem(key); // Clear bad data to fix SyntaxError
    }
  }

  // 2. If no data exists (or was corrupted), create a fresh identity
  const newIdentity: identityKey = {
    anonyId: uuidv4(),
  };

  console.log("Setting new ID...");
  localStorage.setItem(key, JSON.stringify(newIdentity));
  return newIdentity.anonyId as string;
};
