"use client";

import { Button } from "../../../../components/ui/button";

import { useToast } from "../../../../hooks/use-toast";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cleanupExpiredPrivateRoomKeys,
  createPrivateRoom,
  getActivePrivateRoomId,
} from "../../../../lib/privateRoom";

export default function CreateRoom() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setisSubmitting] = useState(false);

  useEffect(() => {
    cleanupExpiredPrivateRoomKeys();
    const activeRoomId = getActivePrivateRoomId();
    if (activeRoomId) {
      router.replace(`/chat/chat-room/${activeRoomId}`);
    }
  }, [router]);

  const onSubmit = async () => {
    setisSubmitting(true);
    try {
      cleanupExpiredPrivateRoomKeys();
      const activeRoomId = getActivePrivateRoomId();
      const roomId = activeRoomId ?? createPrivateRoom();
      router.push(`/chat/chat-room/${roomId}`);
    } catch (error) {
      console.error("Error in creating Room", error);

      toast({
        title: "Signup failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      setisSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-300 px-4 py-8 dark:bg-black sm:px-6">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-5 text-center shadow-md dark:bg-gray-900 sm:p-8 sm:space-y-8">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Create Chat Room
          </h1>
        </div>
        <Button type="submit" disabled={isSubmitting} onClick={onSubmit} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </>
          ) : (
            "Create Chat Room"
          )}
        </Button>
      </div>
    </div>
  );
}
