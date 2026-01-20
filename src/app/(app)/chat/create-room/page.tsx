"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { verifySchema } from "@/Schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as Z from "zod";
import { useRouter } from "next/navigation";

export const CreateRoom = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setisSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: Z.infer<typeof verifySchema>) => {
    console.log(data);
    setisSubmitting(true);
    try {
      const roomId = data.code;
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Code"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please Wait
                </>
              ) : (
                "Sumbit"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateRoom;
