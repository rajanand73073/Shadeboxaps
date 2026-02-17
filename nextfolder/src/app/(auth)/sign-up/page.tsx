"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as Z from "zod";
import Link from "next/link";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "../../../hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "../../../Schemas/signUpSchema";
import { useEffect } from "react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "../../../types/ApiResponse";
import Image from "next/image";
import { Separator } from "../../../components/ui/separator";

import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { FormField } from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";

const Page = () => {
  const [username, setusername] = useState("");
  const [usernamemessage, setusernamemessage] = useState("");
  const [, setisCheckingUsername] = useState(false);
  const [isSubmitting, setisSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const debounce = useDebounceCallback(setusername, 500);
  //zod implementation
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUniqueUsername = async () => {
      if (username) {
        setisCheckingUsername(true);
        setusernamemessage("");
        try {
          const response = await axios.get(
            `/api/check-uniqueusername?username=${username}`,
          );
          setusernamemessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setusernamemessage(
            axiosError.response?.data.message ?? "ERROR CHECKING USERNAME",
          );
        } finally {
          setisCheckingUsername(false);
        }
      }
    };

    checkUniqueUsername();
  }, [username]);

  const onSubmit = async (data: Z.infer<typeof signUpSchema>) => {
    console.log("data", data);
    setisSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
      // console.log("response", response);

      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace(`/verify/${username}`);
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

  const handleGoogleSignIn = () => {
    setisSubmitting(true);
    signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-300 dark:bg-black overflow-hidden">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-900 relative bottom-10">
        <div className="text-center dark:text-white">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 dark:text-white">
            Share Your Message as Mystery
          </h1>
          <p className="mb-4 dark:text-white">
            Sign up to start your anonymous adventure
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounce(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>{usernamemessage}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter you email" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type="password"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col  items-center space-y-4">
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
            </div>
          </form>
        </Form>

        <Separator />

        <div className="flex flex-col">
          <div className="flex justify-center">
            <Button variant="ghost" onClick={handleGoogleSignIn}>
              <Image
                src="/google.png"
                alt="Google Sign In"
                width={32}
                height={32}
              />
            </Button>
          </div>
          <div className="mt-8 text-center">
            <Link href="/sign-in" className="text-blue-500 hover:underline ">
              Already have an account? Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
