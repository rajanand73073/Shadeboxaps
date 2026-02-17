"use client";

import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "../../../types/ApiResponse";
import { useToast } from "../../../hooks/use-toast";
import { useSession } from "next-auth/react";

const Page = () => {
  const [Status, setStatus] = useState("");
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const { data: session } = useSession();
  //renaming data to session for better readability

  useEffect(() => {
    if (!session) {
      setStatus("unauthenticated");
    } else if (session && session.user.isVerified) {
      setStatus(session.user.username ?? "unauthenticated");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !content) {
      toast({
        title: "Error",
        description: "Please filled all fields",
        variant: "destructive",
      });
    }
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        content,
        Status,
      });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
        setUsername("");
        setContent("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError.response) {
        toast({
          title: "Error",
          description: axiosError.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center mx-auto  my-10 ">
          <input
            type="text"
            placeholder="username"
            className="mb-4 p-2 border rounded w-full max-w-md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="grid  gap-2 p-2  rounded w-full max-w-md">
            <Textarea
              placeholder="Type your message here."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button>Send message</Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default Page;
