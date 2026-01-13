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
import { anonymousId } from "@/lib/socket";

function Page() {
  const [messages, setmessages] = useState<{ message: string; id: string, msgId: string }[]>([]);
  const [input, setinput] = useState<string>("");
  const { toast } = useToast();
  const params = useParams<{ roomId: string }>();
  const socket = getSocket();
  const roomId = params.roomId;
  const myAnonyId = anonymousId();

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
      setmessages((prev) => [
        ...prev,
        { message: message.message, id: message.id , msgId: message.msgId},
      ]);
    });

    socket.on("chat-history", (chatHistory) => {
      const updated = chatHistory.map((msg: string) => JSON.parse(msg));
      setmessages(updated);
    });


socket.on("message-deleted", (msgId) => {
  console.log("CLIENT: received message-deleted", msgId);
  setmessages(prev => prev.filter(msg => msg.msgId !== msgId));
});

// Listener is ready before any delete events



    // Cleanup function to remove the listener when the component unmounts
return () => {
  socket.off("receive-message");
  socket.off("chat-history");
  socket.off("message-deleted");  
};

  }, []);


  
  const handlemessage = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (input.trim() === "") return;
    const msgId = crypto.randomUUID();
    socket.emit("send-message", {
      roomId: roomId,
      message: input,
      msgId: msgId
    });

    setmessages((prev) => [...prev, { message: input, id: myAnonyId, msgId: msgId }]);
    setinput("");
  };

  const deleteMessage = (msgId: string) => {
    console.log('del', msgId);
    
     setmessages((prev) => { 
     const updated = prev.filter(msg => msg.msgId !== msgId)
      return updated;
    });
     //updating locally for instant UI response
    
    socket.emit("delete-message", {
      roomId,
      msgId
    });

  

  };

  return (
    <div className="min-h-screen">
      {/* Chat messages display area */}
      <div className="pb-24 px-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto pt-8 h-full">
          <h1 className="text-4xl font-bold mb-4">Chat Room</h1>
          {messages.map((msg) => (
            <div
              key={msg.msgId}
              className={`flex ${msg.id === myAnonyId ? "justify-end" : "justify-start"} `}
            >
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
                          <Reply />
                          Reply
                        </DropdownMenuItem>
                        {msg.id === myAnonyId ? null : 
                        <DropdownMenuItem>
                          <UserRoundXIcon />
                          Block User
                        </DropdownMenuItem>
}
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
                         {msg.id === myAnonyId ? 
                        <DropdownMenuItem
                          className="focus:bg-red-700 focus:text-white"
                          onClick={() => deleteMessage(msg.msgId)}
                        >
                          <TrashIcon />
                          Delete Conversation
                        </DropdownMenuItem>:
                        null 
                        }
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
