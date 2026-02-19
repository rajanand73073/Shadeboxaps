"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "../../../types/ApiResponse";
import { useToast } from "../../../hooks/use-toast";
import { useSession } from "next-auth/react";
import { Paperclip } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";

const Page = () => {
  const [Status, setStatus] = useState("");
  const [username, setUsername] = useState("");
  const [Content, setContent] = useState("");
  const { toast } = useToast();
  const { data: session } = useSession();
  const [MediaUrl, setMediaUrl] = useState("");
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

    if (!username || !Content) {
      toast({
        title: "Error",
        description: "Please filled all fields",
        variant: "destructive",
      });
    }
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        content: Content,
        Status,
        MediaUrl
      });
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
        setUsername("");
        setContent("");
        setMediaUrl("");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      // 2. Get URL
      // 3. Send URL via socket
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center mx-auto my-10 w-full max-w-md">
          <input
            type="text"
            placeholder="username"
            className="mb-4 p-2 border rounded w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Chat Input Section */}
          <div className="flex items-center gap-2 w-full border rounded-xl p-2 shadow-sm">
            {/* Upload Button */}
            <label className="cursor-pointer flex items-center justify-center w-20 h-10 rounded-sm  hover:bg-gray-100 dark:hover:bg-gray-700">
              <Paperclip />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {/* Message Input */}
            <Textarea
              placeholder="Type your message here."
              value={Content}
              onChange={(e) => setContent(e.target.value)}
              className="border-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              className=" px-4 py-2 rounded-lg hover:bg-gray-700 bg-black transition dark:hover:bg-gray-700 dark:bg-blue-500 text-white font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default Page;
