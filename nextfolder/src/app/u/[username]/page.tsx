"use client";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../hooks/use-toast";
import { messageSchema } from "../../../Schemas/messageSchema";
import { ApiResponse } from "../../../types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const Page = () => {
  const param = useParams<{ username: string }>();
  const username = param.username;
  const { toast } = useToast();

  /*Use one approach consistently—either destructure directly from useParams:

const { username } = useParams<{ username: string }>();


Or access the property after assigning the whole object:

const param = useParams<{ username: string }>();
const username = param.username;
 */

  const [isLoading, setisLoading] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setisLoading(true);
    console.log(data);
    try {
      const response = await axios.post(`/api/send-message`, {
        username: username,
        content: data.content,
      });
      console.log("responsesend:", response.data.user);

      toast({
        title: "Success",
        description: response.data.message,
      });
      form.reset({ content: "" });
    } catch (error) {
      const axioserror = error as AxiosError<ApiResponse>;
      console.log("axiosError", axioserror);

      toast({
        title: "Error",
        description: axioserror.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-6 text-center dark:text-white">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Content" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Page;
