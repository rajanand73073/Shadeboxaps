"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Message } from "../model/User.model";
import { X, SendHorizontal } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";

type MessagCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
  receiver: string;
};

const MessageCard = ({
  message,
  onMessageDelete,
  receiver,
}: MessagCardProps) => {
  const { toast } = useToast();
  const [Content, setContent] = useState(" ");
  const handleMessagedelete = () => {
    onMessageDelete(String(message._id));
  };

  const handleSendMessage = async () => {
    if (!Content.trim()) {
      toast({
        title: "Error",
        description: "Message content cannot be empty",
        variant: "destructive",
      });
      return;
    } 
    try {
      const response = await axios.post("/api/send-message", {
        username: message.status,
        content: Content,
        Status: receiver,
      });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Message Sent Successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error sending message",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Message</CardTitle>
          <CardDescription></CardDescription>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMessagedelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <p>{message.content}</p>
      </CardContent>
      {/*here i forgot to add simple logic of unauthenticated by using simply conditional rendering.*/}
      {message.status !== "unauthenticated" && (
        <CardFooter>
          <div className=" flex justify-between space-x-8 w-full ">
            <input
              className="w-full p-2 border-solid outline-blue-500 border border-gray-300 rounded-sm "
              placeholder="Type your message here."
              value={Content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleSendMessage} variant={"ghost"} className="" >
              <SendHorizontal className="-rotate-45 " />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default MessageCard;
