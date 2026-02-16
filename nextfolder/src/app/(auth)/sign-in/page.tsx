"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { useToast } from "../../../hooks/use-toast";
import { signInSchema } from "../../../Schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import * as Z from "zod";

const Page = () => {
  const { data: session } = useSession();
  console.log("session", session);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to the dashboard
  // useEffect(() => {
  //   if (status === "authenticated") {
  //     router.replace("/dashboard");
  //   }
  // }, [status, router]);

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  const onSubmit = async (data: Z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
      callbackUrl: "/dashboard",
    });

    setIsSubmitting(false);
    if (result?.error) {
      console.log("Error while sigin",result.error);
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    
    if (result?.url) {
      console.log("result", result?.url);

      toast({
        title: "Success",
        description: "Successfully signed in! Redirecting...",
      });
      router.replace(result.url);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-300 dark:bg-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Share Mystery Messages!
          </h1>
          <p className="mb-4">Sign in to start messaging</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
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
                      type="password"
                      placeholder="Password"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-center space-y-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please Wait
                  </>
                ) : (
                  "Sign In"
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
            <Link href="/sign-up" className="text-blue-500 hover:underline ">
              Don&apos;t have an account? Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
