"use client";


import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "@/hooks/use-toast";


const Page = () => {
const [username, setUsername] = useState("");
const [content, setContent] = useState("");
const { toast } = useToast();

const handleSubmit = async () =>{
    if(!username || !content){
        toast({
        title: "Error",
        description: "Please filled all fields",
        variant: "destructive",
      });
    }
   try{
    const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        content
    });
    if(response.data.success){
        toast({
        title: "Success",
        description: "Message sent successfully",
        })
        setUsername("");
        setContent("");
    }
    }catch(error){
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
}

  return (
    <>
    <form action={handleSubmit}>
    <div className="flex flex-col items-center justify-center mx-auto  my-10 ">
    <input type="text" 
    placeholder="username" className="mb-4 p-2 border rounded w-full max-w-md"  
    value ={username}
    onChange={(e) => setUsername(e.target.value)}
    />
     <div className="grid  gap-2 p-2  rounded w-full max-w-md">
      <Textarea 
      placeholder="Type your message here."
      value = {content}
      onChange={(e) => setContent(e.target.value)}
      />
      <Button >Send message</Button>
    </div>
    </div>
    </form>
    </>
  )
}

export default Page

