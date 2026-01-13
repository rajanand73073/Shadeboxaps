// client → server
export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
  "send-message": (payload: {
    roomId: string;
    message: string;
    msgId: string;
  }) => void;
  "delete-message":(payload:{
    roomId:string,
    msgId:string
  }) => void,
}

export interface ServerToClientEvents{
    "receive-message":(payload:{
      message:string,
      id:string,
      msgId:string
    }) => void,
    "chat-history":(chatHistory:[]) => void,
    "message-deleted":(msgId:string) => void,
}
