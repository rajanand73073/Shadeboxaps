"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "../../../types/ApiResponse";
import { useToast } from "../../../hooks/use-toast";
import { useSession } from "next-auth/react";
import { Paperclip } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";

const isPhotoFile = (file: File) => file.type.startsWith("image/");

const Page = () => {
  const [Status, setStatus] = useState("");
  const [username, setUsername] = useState("");
  const [Content, setContent] = useState("");
  const { toast } = useToast();
  const { data: session } = useSession();
  //renaming data to session for better readability
  const [MediaUrl, setMediaUrl] = useState("");
  const [Media,setMedia] = useState<File | null>(null);

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
      description: "Please fill all fields",
      variant: "destructive",
    });
    return;
  }

  let uploadedMediaUrl = "";

  try {
    // 1️⃣ If media exists → upload first
    //When chaining async steps, pass data through local variables — not React state.
    //React state updates are asynchronous.
    if (Media) {
      if (!isPhotoFile(Media)) {
        toast({
          title: "Error",
          description: "Only photos can be uploaded",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", Media);

      const uploadResponse = await axios.post("/api/upload", formData);

      if (uploadResponse?.data?.secure_url) {
        uploadedMediaUrl = uploadResponse.data.secure_url;
        console.log("Uploaded URL:", uploadedMediaUrl);
      } else {
        throw new Error("Media upload failed");
      }
    }

    // 2️⃣ Now send message with correct media URL (if any)
    const response = await axios.post<ApiResponse>("/api/send-message", {
      username,
      content: Content,
      Status,
      MediaUrl: uploadedMediaUrl, // 👈 use variable
    }); 

    if (response.data.success) {
      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setUsername("");
      setContent("");
      setMediaUrl("");
      setMedia(null);
    }

  } catch (error) {
    console.error("Error:", error);

    const axiosError = error as AxiosError<ApiResponse>;

    toast({
      title: "Error",
      description:
        axiosError.response?.data.message ||
        "Something went wrong",
      variant: "destructive",
    });
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
    setMedia(file);
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
