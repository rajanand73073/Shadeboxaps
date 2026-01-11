"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  CopyIcon,
  ShareIcon,
  TrashIcon,
  UserRoundXIcon,
  EllipsisVertical,
  Reply,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSocket } from "@/lib/socket";
import { useParams } from "next/navigation";

function Page() {
  const [message, setmessage] = useState<string[]>([]);
  const [input, setinput] = useState<string>("");
  const { toast } = useToast();
  const params = useParams<{ roomId: string }>();

  const socket = getSocket();
  const roomId = params.roomId;
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
    socket.on("receive-message", ({ message, at }) => {
      console.log("Message received from server:", message, at);
      setmessage((prev) => {
        const updated = [...prev, message];
        // saveMessages(updated);
        return updated;
      });
    });

    socket.on("chat-history", (chatHistory: string[]) => {
      console.log("Chat history received from server:", chatHistory);
      setmessage(chatHistory);
      console.log("messages", message);
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      socket.off("receive-message");
      socket.off("chat-history");
    };
  }, []);

 

  const handlemessage = (e: React.FormEvent): void => {
    e.preventDefault();
    if (input.trim() === "") return;

    socket.emit("send-message", {
      roomId: roomId,
      message: input,
    });

    
    // setmessage((prev) => {
    //   const updated = [...prev, input];
    //   return updated;
    // });

    setinput("");
  };

  const deleteMessage = (index: number) => {
    setmessage((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated;
    });
  };

  return (
    <div className="min-h-screen">
      {/* Chat messages display area */}
      <div className="pb-24 px-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto pt-8 h-full">
          <h1 className="text-4xl font-bold mb-4">Chat Room</h1>
          {message.map((msg, index: number) => (
            <div
              key={index}
              className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"} `}
            >
              <div className="bg-gray-100 rounded-lg py-3 pl-3 max-w-[70%] text-blue-900 mt-10 cursor-pointer flex justify-between gap-4 hover:bg-gray-200">
                {msg}
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
                          <Reply />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserRoundXIcon />
                          Block User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShareIcon />
                          Share Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CopyIcon />
                          Copy Conversation
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="focus:bg-red-700 focus:text-white"
                          onClick={() => deleteMessage(index)}
                        >
                          <TrashIcon />
                          Delete Conversation
                        </DropdownMenuItem>
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
      <div className="fixed bottom-0 left-0 w-full  p-4">
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

export default Page;
