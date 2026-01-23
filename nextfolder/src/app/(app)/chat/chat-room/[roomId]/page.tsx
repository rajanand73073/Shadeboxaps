"use client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../../../../../components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "../../../../../hooks/use-toast";
import {
  CopyIcon,
  ShareIcon,
  TrashIcon,
  UserRoundXIcon,
  EllipsisVertical,
  Reply,
  RefreshCw,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../components/ui/dropdown-menu";
import { getSocket } from "../../../../../lib/socket";
import { useParams } from "next/navigation";
import { anonymousId } from "../../../../../lib/socket";
import { randomSeed } from "../../../../../helpers/randomSeed";
import Avatar from "../../../../../components/avatar";
import ShareRoomCard from "../../../../../components/ShareRoomCard";

interface MessageItem {
  message: string;
  id: string;
  msgId: string;
  seed: string;
}

export default function ChatRoomPage() {
  const [messages, setmessages] = useState<MessageItem[]>([]);

  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const [showShare, setShowShare] = useState(false);
  const [input, setinput] = useState<string>("");
  const { toast } = useToast();
  const socket = getSocket(roomId);
  const myAnonyId = anonymousId(roomId) as string;
  console.log("myAnonId", myAnonyId);
  const key = `anon:${roomId}`;
  const [showAvatar, setshowAvatar] = useState(false);
  const [seed, setseed] = useState<string>("");

  useEffect( () => {
  const isCreator = localStorage.getItem(`creator:${roomId}`) === "true";
  if(isCreator){
  localStorage.setItem(`creator:${roomId}`,"false")
  setShowShare(isCreator)
  }
  }, [])
  

  useEffect(() => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID is missing in the URL",
        variant: "destructive",
      });
      return;
    }
    socket.emit("join-room", roomId);
    // The listener is registered once when the component mounts

    socket.on("receive-message", (message) => {
      console.log("mesage", message);

      setmessages((prev) => [
        ...prev,
        {
          message: message.message,
          id: message.id,
          msgId: message.msgId,
          seed: message.seed,
        },
      ]);
    });

    socket.on("chat-history", (chatHistory) => {
      console.log("chathistory", chatHistory);

      const updated = chatHistory.map((msg: string) => JSON.parse(msg));
      console.log("updated", updated);

      setmessages(updated);
    });

    // Listener is ready before any delete events
    socket.on("message-deleted", (msgId) => {
      console.log("CLIENT: received message-deleted", msgId);
      setmessages((prev) => prev.filter((msg) => msg.msgId !== msgId));
    });

    // Receive TTL and schedule cleanup
    socket.on("room-ttl", (ttlSeconds) => {
      if (ttlSeconds <= 0) return;

      // ✅ FIX: merge with stored identity instead of overwriting
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      const updatedIdentity = {
        ...stored,
        createdAt: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(updatedIdentity));

      setTimeout(() => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${myAnonyId}`);
        alert("Room expired. Starting fresh chat.");
        window.location.href = "/";
      }, ttlSeconds * 1000);
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      socket.off("receive-message");
      socket.off("chat-history");
      socket.off("message-deleted");
      socket.off("room-ttl");
    };
  }, []);

  useEffect(() => {
    const key = `anon:${roomId}`;
    const stored = localStorage.getItem(key);
    let parsed = null;

    if (stored !== null) {
      parsed = JSON.parse(stored);
      if (parsed.createdAt) {
        if (!(Date.now() - parsed.createdAt < 5*60* 1000)) {
          console.log("Removing Key...");
          localStorage.removeItem(key);
        }
      }
    }
  }, []);

  useEffect(() => {
    const storedIdentity = JSON.parse(localStorage.getItem(key) || "{}");
    console.log("StoredIdentity",storedIdentity.seed);
    
    setseed(storedIdentity.seed ?? "");
    if (!storedIdentity.seed) {
      console.log("setting seed");
      createSeed();
      setshowAvatar(true);
    }
  }, []);

  const createSeed = () => {
    setseed(randomSeed());
  };

  const saveAvatar = (svgCode: string) => {
    // ✅ FIX: merge instead of overwrite
    const stored = JSON.parse(localStorage.getItem(key) || "{}");
    const updatedIdentity = {
      ...stored,
      seed: svgCode,
    };
    localStorage.setItem(key, JSON.stringify(updatedIdentity));
    setseed(svgCode);
    setshowAvatar(false);
  };

  const handlemessage = (e: React.FormEvent): void => {
    e.preventDefault();

    if (input.trim() === "") return;
    const msgId = uuidv4();
    console.log("Sending seed", seed);

    socket.emit("send-message", {
      roomId: roomId,
      message: input,
      msgId: msgId,
      seed: seed,
    });

    setmessages((prev) => [
      ...prev,
      { message: input, id: myAnonyId, msgId: msgId, seed: seed },
    ]);
    setinput("");
  };

  const deleteMessage = (msgId: string) => {
    console.log("del", msgId);

    setmessages((prev) => {
      const updated = prev.filter((msg) => msg.msgId !== msgId);
      return updated;
    });
    //updating locally for instant UI response

    socket.emit("delete-message", {
      roomId,
      msgId,
    });
  };

  const refreshAvatar = () => {
    setseed(randomSeed());
  };

  return (
    <div className="min-h-screen">
  
  {showShare && (
  <ShareRoomCard
    roomId={roomId}
    onClose={() => setShowShare(false)}
  />
)}

      {showAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-gray-300 p-6 rounded-2xl shadow-lg max-w-md text-center dark:bg-gray-900">
            <h2 className="text-xl font-bold mb-2">🎉 Your Avatar!</h2>

            <Avatar Seed={seed} />

            <div className="flex justify-evenly ml-8 ">
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => saveAvatar(seed)}
              >
                Got it!
              </button>
              <button onClick={refreshAvatar} className="mx-10 py-2 mt-4 ">
                <RefreshCw />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages display area */}
      <div className="pb-24 px-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto pt-8 h-full">
          <h1 className="text-4xl font-bold mb-4">Chat Room</h1>
          {messages.map((msg) => (
            <div
              key={msg.msgId}
              className={`flex ${msg.id === myAnonyId ? "justify-end" : "justify-start"} gap-x-2`}
            >
              <div className="w-10 h-10 rounded-full">
                <Avatar Seed={msg.seed} isMessageComponent={true} />
              </div>
              <div className="bg-gray-100 rounded-lg py-3 pl-3 max-w-[70%] text-blue-900 mt-10 cursor-pointer flex justify-between gap-4 hover:bg-gray-200">
                {msg.message}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <EllipsisVertical />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="[--radius:1rem]"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Reply /> Reply
                        </DropdownMenuItem>
                        {msg.id === myAnonyId ? null : (
                          <DropdownMenuItem>
                            <UserRoundXIcon /> Block User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <ShareIcon /> Share Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CopyIcon /> Copy Conversation
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {msg.id === myAnonyId ? (
                          <DropdownMenuItem
                            className="focus:bg-red-700 focus:text-white"
                            onClick={() => deleteMessage(msg.msgId)}
                          >
                            <TrashIcon /> Delete Conversation
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* chat input area */}
      <div className="fixed bottom-0 left-0 w-full p-4">
        <form action="" onSubmit={handlemessage}>
          <div className="grid gap-8 max-w-6xl mx-auto pb-10">
            <input
              type="text"
              className="p-auto flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your message here."
              value={input}
              onChange={(e) => setinput(e.target.value)}
            />
            <Button type="submit">Send message</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
