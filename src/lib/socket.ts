import { io, Socket } from "socket.io-client";
import {ServerToClientEvents,  ClientToServerEvents } from "@/types/socket";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> 

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3000");
  }
  return socket;
};