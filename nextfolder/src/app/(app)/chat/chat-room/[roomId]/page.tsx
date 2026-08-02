"use client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../../../../../components/ui/button";
import { useState, useEffect, useMemo } from "react";
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
import { useParams, useSearchParams } from "next/navigation";
import { anonymousId } from "../../../../../lib/socket";
import { randomSeed } from "../../../../../helpers/randomSeed";
import Avatar from "../../../../../components/avatar";
import ShareRoomCard from "../../../../../components/ShareRoomCard";
import {
  cleanupExpiredPrivateRoomKeys,
  clearActivePrivateRoom,
  savePrivateRoom,
  savePrivateRoomTtl,
  PRIVATE_ROOM_DURATION_MS,
} from "../../../../../lib/privateRoom";

interface MessageItem {
  message: string;
  id: string;
  msgId: string;
  seed: string;
}

export default function ChatRoomPage() {
  const [messages, setmessages] = useState<MessageItem[]>([]);

  const params = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();
  const roomId = params.roomId;
  const isPublicRoom = searchParams.get("type") === "public";
  const [showShare, setShowShare] = useState(false);
  const [input, setinput] = useState<string>("");
  const { toast } = useToast();
  const myAnonyId = useMemo(() => anonymousId(roomId), [roomId]);
  const socket = useMemo(
    () => getSocket(roomId, myAnonyId),
    [roomId, myAnonyId],
  );
  console.log("myAnonId", myAnonyId);
  const key = `anon:${roomId}`;
  const [showAvatar, setshowAvatar] = useState(false);
  const [seed, setseed] = useState<string>("");

  useEffect(() => {
    cleanupExpiredPrivateRoomKeys();

    const isCreator =
      !isPublicRoom && localStorage.getItem(`creator:${roomId}`) === "true";
    if (isCreator) {
      localStorage.setItem(`creator:${roomId}`, "false");
      setShowShare(isCreator);
    }

    if (!isPublicRoom) {
      savePrivateRoom(roomId, Date.now() + PRIVATE_ROOM_DURATION_MS);
    }
  }, [isPublicRoom, roomId]);

  useEffect(() => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID is missing in the URL",
        variant: "destructive",
      });
      return;
    }
    if (isPublicRoom) {
      socket.emit("join-public-room", roomId);
    } else {
      socket.emit("join-room", roomId);
    }
    // The listener is registered once when the component mounts

    const handleReceiveMessage = (message: MessageItem) => {
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
    };

    const handleChatHistory = (chatHistory: string[]) => {
      console.log("chathistory", chatHistory);

      const updated = chatHistory.map((msg: string) => JSON.parse(msg));
      console.log("updated", updated);

      setmessages(updated);
    };

    // Listener is ready before any delete events
    const handleMessageDeleted = (msgId: string) => {
      console.log("CLIENT: received message-deleted", msgId);
      setmessages((prev) => prev.filter((msg) => msg.msgId !== msgId));
    };

    // Receive TTL and schedule cleanup
    const handleRoomTtl = (ttlSeconds: number) => {
      if (ttlSeconds <= 0) return;
      const expiresAt = Date.now() + ttlSeconds * 1000;

      if (!isPublicRoom) {
        savePrivateRoomTtl(roomId, ttlSeconds);
      }

      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      const updatedIdentity = {
        ...stored,
        createdAt: Date.now(),
        expiresAt,
      };
      localStorage.setItem(key, JSON.stringify(updatedIdentity));

      setTimeout(() => {
        if (!isPublicRoom) {
          clearActivePrivateRoom(roomId);
          cleanupExpiredPrivateRoomKeys();
        }
        localStorage.removeItem(`${myAnonyId}`);
        alert("Room expired.");
        window.location.href = isPublicRoom ? "/chat/public-room" : "/";
      }, ttlSeconds * 1000);
    };

    if (isPublicRoom) {
      socket.on("receive-public-message", handleReceiveMessage);
      socket.on("public-chat-history", handleChatHistory);
      socket.on("public-message-deleted", handleMessageDeleted);
      socket.on("public-room-ttl", handleRoomTtl);
    } else {
      socket.on("receive-message", handleReceiveMessage);
      socket.on("chat-history", handleChatHistory);
      socket.on("message-deleted", handleMessageDeleted);
      socket.on("room-ttl", handleRoomTtl);
    }

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("chat-history", handleChatHistory);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("room-ttl", handleRoomTtl);
      socket.off("receive-public-message", handleReceiveMessage);
      socket.off("public-chat-history", handleChatHistory);
      socket.off("public-message-deleted", handleMessageDeleted);
      socket.off("public-room-ttl", handleRoomTtl);
    };
  }, [isPublicRoom, key, myAnonyId, roomId, socket, toast]);

  useEffect(() => {
    cleanupExpiredPrivateRoomKeys();
  }, []);

  useEffect(() => {
    const storedIdentity = JSON.parse(localStorage.getItem(key) || "{}");
    console.log("StoredIdentity", storedIdentity.seed);

    setseed(storedIdentity.seed ?? "");
    if (!storedIdentity.seed) {
      console.log("setting seed");
      setseed(randomSeed());
      setshowAvatar(true);
    }
  }, [key]);

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

    if (isPublicRoom) {
      socket.emit("send-public-message", {
        roomId: roomId,
        message: input,
        msgId: msgId,
        seed: seed,
      });
    } else {
      socket.emit("send-message", {
        roomId: roomId,
        message: input,
        msgId: msgId,
        seed: seed,
      });
    }

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

    if (isPublicRoom) {
      socket.emit("delete-public-message", {
        roomId,
        msgId,
      });
    } else {
      socket.emit("delete-message", {
        roomId,
        msgId,
      });
    }
  };

  const refreshAvatar = () => {
    setseed(randomSeed());
  };

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {showShare && (
        <ShareRoomCard roomId={roomId} onClose={() => setShowShare(false)} />
      )}

      {showAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-gray-300 p-5 text-center shadow-lg dark:bg-gray-900 sm:p-6">
            <h2 className="text-xl font-bold mb-2">🎉 Your Avatar!</h2>

            <Avatar Seed={seed} />

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => saveAvatar(seed)}
              >
                Got it!
              </button>
              <button onClick={refreshAvatar} className="py-2 mt-4">
                <RefreshCw />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages display area */}
      <div className="overflow-y-auto px-4 pb-44 sm:pb-32">
        <div className="mx-auto h-full max-w-6xl pt-6 sm:pt-8">
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
            {isPublicRoom ? "Public Chat Room" : "Chat Room"}
          </h1>
          {messages.map((msg) => (
            <div
              key={msg.msgId}
              className={`flex ${msg.id === myAnonyId ? "justify-end" : "justify-start"} gap-x-2`}
            >
              <div className="h-10 w-10 shrink-0 rounded-full">
                <Avatar Seed={msg.seed} isMessageComponent={true} />
              </div>
              <div className="mt-10 flex max-w-[85%] cursor-pointer justify-between gap-3 rounded-lg bg-gray-100 px-3 py-3 text-blue-900 hover:bg-gray-200 sm:max-w-[70%]">
                <p className="min-w-0 break-words">{msg.message}</p>
                <div className="shrink-0">
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
      <div className="fixed bottom-0 left-0 w-full border-t bg-background/95 p-4 backdrop-blur">
        <form action="" onSubmit={handlemessage}>
          <div className="mx-auto grid max-w-6xl gap-3 pb-2 sm:grid-cols-[1fr_auto] sm:items-center">
            <input
              type="text"
              className="min-w-0 resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message here."
              value={input}
              onChange={(e) => setinput(e.target.value)}
            />
            <Button type="submit" className="w-full sm:w-auto">Send message</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
