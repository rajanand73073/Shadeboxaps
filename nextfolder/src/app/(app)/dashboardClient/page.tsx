"use client";

import { useToast } from "../../../hooks/use-toast";
import { Message } from "../../../model/User.model";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { ApiResponse } from "../../../types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Switch } from "../../../components/ui/switch";
import { useSession } from "next-auth/react";
import { Button } from "../../../components/ui/button";
import { Loader2, RefreshCcw, Copy, Check } from "lucide-react";
import { Separator } from "../../../components/ui/separator";
import MessageCard from "../../../components/messageCard";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

// 👇 Inner component so that `useSearchParams` is safe inside Suspense
function DashboardClientInner() {
  const [Messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const form = useForm();
  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");
  const { data: session } = useSession();
  //renaming data to session for better readability
  const username = session?.user.username;
  console.log("session in dashboard", session);

  console.log("username", username);

  // ✅ Suspense-safe hook
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "true";

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/get-messages");
      if (response.data.Message) {
        setMessages(response.data.Message);
        toast({
          title: "Success",
          description: "Messages fetched successfully",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: axiosError.response?.data.message ?? "Error fetching messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch accepting message status
  const isAcceptingMessages = useCallback(async () => {
    setIsLoading(true);
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-message");
      setValue("acceptMessages", response.data.isAcceptingMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error fetching Accepting Status",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  // Delete a message
  const handleDeleteMessage = async (messageId: string) => {
    setMessages(Messages.filter((m) => m?._id !== messageId));
    try {
      const response = await axios.post<ApiResponse>("/api/delete-messages", {
        messageId,
      });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error deleting message",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    }
  };

  // Toggle accept messages switch
  const handleToggleSwitch = async () => {
    setIsSwitchLoading(true);
    try {
      await axios.post<ApiResponse>("/api/accept-message", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({ title: "Success", description: "Successfully toggled switch" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error toggling switch",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };

  // Copy unique link
  const url = process.env.NEXT_PUBLIC_APP_URL;
  const handleCopy = () => {
    navigator.clipboard.writeText(`${url}/SendMessage`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    isAcceptingMessages();
    if (welcome) setShowPopup(true);
  }, [session, welcome, fetchMessages, isAcceptingMessages]);
   


  const shareWhatsapp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(url + "/SendMessage")}`,
      "_blank",
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(url + "/SendMessage")}`,
      "_blank",
    );
  };
 
  const shareInstagram = () => {
    const instagramShareUrl = `https://www.instagram.com/?url=${encodeURIComponent(url + "/SendMessage")}`;
    window.open(instagramShareUrl, "_blank");
  }


  return (
    <>
      {/* 🎉 Welcome popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-gray-300 p-6 rounded-2xl shadow-lg max-w-md text-center dark:bg-gray-900 space-y-6">
            <h2 className="text-xl font-bold mb-2">🎉 Welcome to ShadeBox!</h2>
            <div className="flex items-center gap-2 p-2 border rounded-md ">
              <span className="truncate text-sm">
                Your unique link: {`${url}/SendMessage`}
              </span>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {copied ? (
                  <Check className="text-green-500 w-5 h-5" />
                ) : (
                  <Copy className="text-gray-500 w-5 h-5" />
                )}
              </button>
            </div>
            <div>
              <span className=" font-bold rounded p-1 my-2">Share  link To connect Socially but Anonymously!</span>
               <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={shareWhatsapp}
            className="p-3 rounded-full  text-white hover:scale-110 transition"
          >
            <Image src="/whatsapp.png" alt="WhatsApp" width={40} height={40} />
          </button>
            
            <Button variant="ghost" onClick={shareTwitter}    className="hover:scale-110 transition mt-3">
         
            <Image src="/twitter.png" alt="Twitter" width={40} height={40} />
          </Button>
            <button
            onClick={shareInstagram}
            className="p-3 rounded-full  text-white hover:scale-110 transition"
          >
            <Image src="/instagram.png" alt="Instagram  " width={40} height={40} />
          </button>
        </div>

            </div>
            <Button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowPopup(false)}
            >
              Got it!
            </Button>
          </div>
        </div>
      )}

      {/* Dashboard content */}
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl dark:bg-gray-900">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">
          {username} Dashboard
        </h1>

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

        <Button className="mt-4" variant="outline" onClick={fetchMessages}>
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
              message={message}
              onMessageDelete={handleDeleteMessage}
              receiver={username ?? "unknown"}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// 👇 Export default wrapped in Suspense
export default function DashboardClient() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardClientInner />
    </Suspense>
  );
}
