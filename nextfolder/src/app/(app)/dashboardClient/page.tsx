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
import Link from "next/link";

import {
  Loader2,
  RefreshCcw,
  Copy,
  Check,
  Loader,
  ArrowRight,
} from "lucide-react";
import { Separator } from "../../../components/ui/separator";
import MessageCard from "../../../components/messageCard";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  createPrivateRoom,
  getActivePrivateRoomId,
} from "../../../lib/privateRoom";

// 👇 Inner component so that `useSearchParams` is safe inside Suspense
function DashboardClientInner() {
  const [Messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoiningPrivateRoom, setIsJoiningPrivateRoom] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const form = useForm();
  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");
  const { data: session } = useSession();
  const router = useRouter();
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
  };

  const handlePrivateRoomJoin = () => {
    setIsJoiningPrivateRoom(true);
    const activeRoomId = getActivePrivateRoomId();
    const roomId = activeRoomId ?? createPrivateRoom();
    router.push(`/chat/chat-room/${roomId}`);
  };

  return (
    <>
      {/* 🎉 Welcome popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-md space-y-6 overflow-y-auto rounded-lg bg-gray-300 p-5 text-center shadow-lg dark:bg-gray-900 sm:p-6">
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
              <span className=" font-bold rounded p-1 my-2">
                Share link To connect Socially but Anonymously!
              </span>
              <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6">
                <button
                  onClick={shareWhatsapp}
                  className="p-3 rounded-full  text-white hover:scale-110 transition"
                >
                  <Image
                    src="/whatsapp.png"
                    alt="WhatsApp"
                    width={40}
                    height={40}
                  />
                </button>

                <Button
                  variant="ghost"
                  onClick={shareTwitter}
                  className="hover:scale-110 transition mt-3"
                >
                  <Image
                    src="/twitter.png"
                    alt="Twitter"
                    width={40}
                    height={40}
                  />
                </Button>
                <button
                  onClick={shareInstagram}
                  className="p-3 rounded-full  text-white hover:scale-110 transition"
                >
                  <Image
                    src="/instagram.png"
                    alt="Instagram  "
                    width={40}
                    height={40}
                  />
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
      <div className="mx-auto my-6 w-[calc(100%-2rem)] max-w-6xl rounded bg-white p-4 dark:bg-gray-900 sm:my-8 sm:p-6">
        <h1 className="mb-4 break-words text-3xl font-bold dark:text-white sm:text-4xl">
          {username} Dashboard
        </h1>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onCheckedChange={handleToggleSwitch}
            disabled={isSwitchLoading}
          />
          <span>
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

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {Messages.map((message) => (
            <MessageCard
              key={String(message?._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
              receiver={username ?? "unknown"}
            />
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            onClick={handlePrivateRoomJoin}
            disabled={isJoiningPrivateRoom}
            className="group relative min-h-14 w-full rounded-xl px-5 py-4 text-base font-medium overflow-hidden cursor-pointer bg-gradient-to-r from-blue-400/70 to-blue-200/70 backdrop-blur-sm border border-white/10 hover:border-indigo-500/30 hover:bg-gradient-to-r hover:from-gray-400/50 hover:to-gray-700/50 hover:bg-white/10 transition-all duration-300 dark:border-gray-500/30 dark:hover:border-indigo-500/50 dark:hover:bg-gradient-to-r dark:hover:from-gray-400/50 dark:hover:to-gray-700/50 sm:w-auto sm:px-8 sm:text-lg"
          >
            {isJoiningPrivateRoom ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </>
            ) : (
              <>
                <ArrowRight /> Private Chat Room
              </>
            )}
          </Button>
          <Link
            href="/chat/public-room"  
         
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-medium overflow-hidden group-hover:bg-gradient-to-r group-hover:from-gray-400/50 group-hover:to-gray-700/50 group-hover:bg-white/10 transition-all duration-300 sm:w-auto sm:px-8 sm:text-lg"
          >
            <ArrowRight /> Explore Public Rooms
          </Link>
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
