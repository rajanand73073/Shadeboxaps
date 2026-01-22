import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../types/socket";
import { v4 as uuidv4 } from "uuid";

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export interface identityKey {
  anonyId?: string;
  seed?: string;
  createdAt?: number;
}

export const identity: identityKey = {};

export const getSocket = (roomId: string) => {
  if (!socket) {

    socket = io(process.env.NEXT_PUBLIC_APP_URL, {
      auth: {
        anonyId: anonymousId(roomId),
      },
    });
  }
  return socket;
};

export const anonymousId = (roomId: string): string => {
  const key = `anon:${roomId}`;
  const storedValue = localStorage.getItem(key);

  if (storedValue) {
    try {
      const parseData: identityKey = JSON.parse(storedValue);
      if (parseData.anonyId) {
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
