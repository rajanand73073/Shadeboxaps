"use client";

import { Button } from "../../../../components/ui/button";

import { useToast } from "../../../../hooks/use-toast";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export default function CreateRoom() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setisSubmitting] = useState(false);

  const onSubmit = async () => {
    setisSubmitting(true);
    try {
      const roomId = nanoid(12);
      localStorage.setItem(`creator:${roomId}`, "true");
      router.push(`/room/${roomId}`);
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
    <div className="flex justify-center items-center  min-h-screen bg-gray-300 dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Create Chat Room
          </h1>
        </div>
        <Button type="submit" disabled={isSubmitting} onClick={onSubmit}>
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
