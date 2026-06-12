// client → server
export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
  "send-message": (payload: {
    roomId: string;
    message: string;
    msgId: string;
    seed: string;
  }) => void;
  "delete-message": (payload: { roomId: string; msgId: string }) => void;
  "join-public-room": (roomId: string) => void;
  "send-public-message": (payload: {
    roomId: string;
    message: string;
    msgId: string;
    seed: string;
  }) => void;
  "delete-public-message": (payload: { roomId: string; msgId: string }) => void;
}

export interface ServerToClientEvents {
  "receive-message": (payload: {
    message: string;
    id: string;
    msgId: string;
    seed: string;
  }) => void;
  "chat-history": (chatHistory: string[]) => void;
  "message-deleted": (msgId: string) => void;
  "room-ttl": (ttl: number) => void;
  "receive-public-message": (payload: {
    message: string;
    id: string;
    msgId: string;
    seed: string;
  }) => void;
  "public-chat-history": (chatHistory: string[]) => void;
  "public-message-deleted": (msgId: string) => void;
  "public-room-ttl": (ttl: number) => void;
  "check-localstorage": () => void;
}
