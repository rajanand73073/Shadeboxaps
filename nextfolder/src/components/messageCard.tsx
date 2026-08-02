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
import { X, SendHorizontal, Paperclip } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { CldImage } from 'next-cloudinary'; 

const isPhotoFile = (file: File) => file.type.startsWith("image/");

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
  const [MediaUrl, setMediaUrl] = useState("");



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
        MediaUrl
      });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Message Sent Successfully",
        })
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
    finally{
        setContent("");
        setMediaUrl("");
    }
  };



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isPhotoFile(file)) {
      toast({
        title: "Error",
        description: "Only photos can be uploaded",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    console.log("Selected file:", file);
    try {
      // Here you will:
      // 1. Upload to Cloudinary
      const formData = new FormData();
       formData.append("file", file);
      const response = await axios.post("/api/upload", formData);
      if (response && response.data) {
        console.log("Cloudinary URL:", response.data.secure_url);
        setMediaUrl(response.data.secure_url)
        // You can set this URL to state or directly send it via socket
      } else {
        console.error("Failed to upload file to Cloudinary.");
      }
      // 3. Send URL via socket
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
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
        {message.mediaUrl && (<CldImage src={message.mediaUrl}
            alt="Attached Media"
            className="my-4 h-20 w-20 rounded overflow-hidden "
            width={400}
            height={300}
          />
        ) }
        <p className="break-words">{message.content}</p>
      </CardContent>
      {/*here i forgot to add simple logic of unauthenticated by using simply conditional rendering.*/}
      {message.status !== "unauthenticated" && (
        <CardFooter>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
             <label className="cursor-pointer flex h-10 w-full items-center justify-center rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 sm:w-14 sm:shrink-0">
              <Paperclip />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <input
              className="min-w-0 w-full rounded-sm border border-solid border-gray-300 p-2 outline-blue-500"
              placeholder="Type your message here."
              value={Content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleSendMessage} variant={"ghost"} className="w-full sm:w-auto sm:shrink-0" >
              <SendHorizontal className="-rotate-45 " />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default MessageCard;
