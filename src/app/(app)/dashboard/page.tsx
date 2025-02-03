"use client";

import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User.model";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import MessageCard from "@/components/messageCard";

const Page = () => {
  const [Messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setisLoading] = useState(false);
  const [isSwitchLoading, setisSwitchLoading] = useState(false);

  const { toast } = useToast();

  const handledeleteMessage = (messageId: string) => {
    setMessages(Messages.filter((message) => message?._id !== messageId));
  };

  const form = useForm();

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  // Todo:checking user accepting messages or  not or check status

  const isAcceptingMessages = useCallback(async () => {
    setisLoading(true);
    setisSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-message");
      console.log("isAcceptingMessages", response.data.isAcceptingMessage);
      setValue("acceptMessages", response.data.isAcceptingMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error while fetching Accepting Status",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setisLoading(false);
      setisSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(async () => {
    setisLoading(true);
    console.log("response");

    try {
      const response = await axios.get<ApiResponse>("/api/get-messages");
      console.log("messages", response.data);

      if (response.data.Message) {
        setMessages(response.data.Message);
        toast({
          title: "success",
          description: "Successfully Messages Fetched",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;

      toast({
        title: "Error while fetching Messages",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setisLoading(false);
      console.log("response");
    }
  }, [toast]);

  const { data: session } = useSession();
const username = session?.user.username

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    isAcceptingMessages();
  }, [toast, fetchMessages, session, isAcceptingMessages]);

  const handleToggleSwitch = async () => {
    // setisLoading(true);
    setisSwitchLoading(true);

    try {
      console.log("acceptmessages", acceptMessages);

      const response = await axios.post<ApiResponse>("/api/accept-message", {
        acceptMessages: !acceptMessages,
      });
      console.log("response", response.data);

      setValue("acceptMessages", !acceptMessages);

      toast({
        title: "Success",
        description: "Successfully Toggle The Switch",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error while Toggle Button",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      // setisLoading(false);
      setisSwitchLoading(false);
    }
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4 dark:text-white">
   {username} Dashboard
      </h1>

      <div className="mb-4">
        {/* <h2 className="text-lg font-semibold mb-2 dark:text-gray-300">
          Copy Your Unique Link
        </h2>{" "} */}
        {/* <div className="flex items-center">
        <input
          type="text"
          value={profileUrl}
          disabled
          className="input input-bordered w-full p-2 mr-2"
        />
        <Button onClick={copyToClipboard}>Copy</Button>
      </div> */}
      </div>
      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleToggleSwitch}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages();
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {Messages.map((message) => (
          <MessageCard
            key={String(message?._id)}
            message={message as Message}
            onMessageDelete={handledeleteMessage}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
