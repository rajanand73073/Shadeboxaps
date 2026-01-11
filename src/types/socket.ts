// client → server
export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
  "send-message": (payload: {
    roomId: string;
    message: string;
  }) => void;
}

export interface ServerToClientEvents{
    "receive-message":(payload:{
      message:string,
      id:string
    }) => void,
    "chat-history":(chatHistory:[]) => void,
}
