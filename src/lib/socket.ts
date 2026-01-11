import { io, Socket } from "socket.io-client";
import {ServerToClientEvents,  ClientToServerEvents } from "@/types/socket";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> 

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3000",{
      auth:{
        anonyId :anonymousId()
      }
    });
  }
  return socket;
};

export const anonymousId = () => {
   let id =  localStorage.getItem("anonymousId");
   if(!id){
     id = crypto.randomUUID();
     localStorage.setItem("anonymousId",id);
   }
  return id;
};