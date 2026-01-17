"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader, Loader2, Mail } from "lucide-react"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import messages from "@/message.json";
import multivatar from "@/lib/multivatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [Loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleLoading = () => {
    setLoading(true);
  };

  return (
    <>
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12  text-white ">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            True Feedback - Where your identity remains a secret.
          </p>
        </section>

        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-lg md:max-w-xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex  md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0" />
                    <div>
                      <p>{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>

      <div className="mx-auto flex items-center justify-center  space-x-8">
        <Link href="/sign-up">
          <Button
            onSubmit={handleLoading}
            className="group px-8 py-8 rounded-xl text-lg font-medium cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.15)] bg-gradient-to-r from-indigo-400 to-purple-400 opacity-90 border border-indigo-300/50 hover:opacity-100 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:border-indigo-400/60 transition-all duration-300

"
          >
            {Loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </>
            ) : (
              <>
                <ArrowRight /> Get Started
              </>
            )}
          </Button>
        </Link>

        <Link href="/chat/create-room">
          <Button
            onSubmit={handleLoading}
            className="group relative px-8 py-8 rounded-xl text-lg font-medium overflow-hidden cursor-pointer bg-gradient-to-r from-blue-400/70 to-blue-200/70 backdrop-blur-sm border border-white/10 hover:border-indigo-500/30 hover:bg-gradient-to-r hover:from-gray-400/50 hover:to-gray-700/50 hover:bg-white/10 transition-all duration-300 dark:border-gray-500/30 dark:hover:border-indigo-500/50 dark:hover:bg-gradient-to-r dark:hover:from-gray-400/50 dark:hover:to-gray-700/50"
          >
            {Loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </>
            ) : (
              <>
                <ArrowRight /> Send Message Publicly
              </>
            )}
          </Button>
        </Link>
      </div>
    </>
  );
}
