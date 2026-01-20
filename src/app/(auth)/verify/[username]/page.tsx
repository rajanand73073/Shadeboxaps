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
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as Z from "zod";
import { signIn } from "next-auth/react";

const Verifyaccount = () => {
  const params = useParams<{ username: string }>();
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
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      });
      console.log("response", response.data);

      toast({
        title: "Success",
        description: response.data.message,
      });

      const loginRes = await signIn("credentials", {
        redirect: false,
        identifier: params.username,
        verifyCode: data.code,
      });

      console.log("Login response", loginRes);

      if (loginRes && loginRes.ok) {
        console.log("Login successful");
        router.replace(`/dashboard?welcome=true`);
      }
      setisSubmitting(false);
    } catch (error) {
      console.error("Error in signup of user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast({
        title: "Signup failed",
        description: errorMessage,
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
            Verify Your Code
          </h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
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
                "Signup"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Verifyaccount;
