import { nanoid } from "nanoid";

const ACTIVE_PRIVATE_ROOM_KEY = "activePrivateRoom";
const ANONYMOUS_ROOM_PREFIX = "anon:";
const CREATOR_ROOM_PREFIX = "creator:";
export const PRIVATE_ROOM_DURATION_MS = 5 * 60 * 1000;

interface ActivePrivateRoom {
  roomId: string;
  expiresAt: number;
}

interface ExpiringStoredValue {
  createdAt?: number;
  expiresAt?: number;
}

const isBrowser = () => typeof window !== "undefined";

const readActivePrivateRoom = (): ActivePrivateRoom | null => {
  if (!isBrowser()) return null;

  const storedRoom = localStorage.getItem(ACTIVE_PRIVATE_ROOM_KEY);
  if (!storedRoom) return null;

  try {
    const room = JSON.parse(storedRoom) as ActivePrivateRoom;
    if (!room.roomId || !room.expiresAt || Date.now() >= room.expiresAt) {
      localStorage.removeItem(ACTIVE_PRIVATE_ROOM_KEY);
      return null;
    }

    return room;
  } catch (error) {
    console.error("Corrupted active private room found, clearing it:", error);
    localStorage.removeItem(ACTIVE_PRIVATE_ROOM_KEY);
    return null;
  }
};

export const getActivePrivateRoomId = (): string | null => {
  return readActivePrivateRoom()?.roomId ?? null;
};

export const createPrivateRoom = (): string => {
  const roomId = nanoid(12);
  savePrivateRoom(roomId, Date.now() + PRIVATE_ROOM_DURATION_MS);
  localStorage.setItem(`creator:${roomId}`, "true");

  return roomId;
};

export const savePrivateRoom = (roomId: string, expiresAt: number) => {
  if (!isBrowser()) return;

  localStorage.setItem(
    ACTIVE_PRIVATE_ROOM_KEY,
    JSON.stringify({ roomId, expiresAt }),
  );
};

export const savePrivateRoomTtl = (roomId: string, ttlSeconds: number) => {
  if (ttlSeconds <= 0) return;

  savePrivateRoom(roomId, Date.now() + ttlSeconds * 1000);
};

export const clearActivePrivateRoom = (roomId?: string) => {
  if (!isBrowser()) return;

  const activeRoom = readActivePrivateRoom();
  if (!roomId || activeRoom?.roomId === roomId) {
    localStorage.removeItem(ACTIVE_PRIVATE_ROOM_KEY);
  }
};

const getStoredExpiresAt = (value: ExpiringStoredValue): number | null => {
  if (typeof value.expiresAt === "number") {
    return value.expiresAt;
  }

  if (typeof value.createdAt === "number") {
    return value.createdAt + PRIVATE_ROOM_DURATION_MS;
  }

  return null;
};

export const cleanupExpiredPrivateRoomKeys = (now = Date.now()) => {
  if (!isBrowser()) return;

  readActivePrivateRoom();

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith(ANONYMOUS_ROOM_PREFIX)) continue;

    const storedValue = localStorage.getItem(key);
    if (!storedValue) continue;

    try {
      const parsed = JSON.parse(storedValue) as ExpiringStoredValue;
      const expiresAt = getStoredExpiresAt(parsed);

      if (expiresAt !== null && now >= expiresAt) {
        const roomId = key.slice(ANONYMOUS_ROOM_PREFIX.length);
        localStorage.removeItem(key);
        localStorage.removeItem(`${CREATOR_ROOM_PREFIX}${roomId}`);
      }
    } catch (error) {
      console.error("Corrupted private room key found, clearing it:", key, error);
      localStorage.removeItem(key);
    }
  }
};
