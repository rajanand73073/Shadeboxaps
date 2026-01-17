// client → server
export interface ClientToServerEvents {
  "join-room": (roomId: string) => void;
  "send-message": (payload: {
    roomId: string;
    message: string;
    msgId: string;
    seed:string
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
      msgId:string,
      seed:string
    }) => void,
    "chat-history":(chatHistory:[]) => void,
    "message-deleted":(msgId:string) => void,
    "room-ttl":(ttl:number) => void
}
