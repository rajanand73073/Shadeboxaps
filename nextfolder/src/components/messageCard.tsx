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
import { X,SendHorizontal } from "lucide-react";

type MessagCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: MessagCardProps) => {
  const handleMessagedelete = () => {
    onMessageDelete(String(message._id));
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
      {message.status === "authenticated" && (
        <CardFooter>
          <div className=" flex justify-between gap-5 ">
            <input
              type="text"
              className="w-full p-2 border-solid outline-blue-500 border border-gray-300 rounded-sm "
            />
            <SendHorizontal className="-rotate-45" />
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default MessageCard;
