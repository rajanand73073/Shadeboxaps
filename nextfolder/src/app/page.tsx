"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import { ArrowRight, Loader, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import messages from "../message.json";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../components/ui/carousel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { status } = useSession();
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
      <main className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-10 text-white sm:px-6 md:px-12 lg:px-24">
        <section className="mb-8 max-w-4xl text-center md:mb-12">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-3 text-base md:mt-4 md:text-lg">
            True Feedback - Where your identity remains a secret.
          </p>
        </section>

        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-sm sm:max-w-lg md:max-w-xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
                    <Mail className="flex-shrink-0" />
                    <div className="min-w-0">
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

      <div className="mx-auto flex w-full items-center justify-center px-4 pb-10">
        <Link href="/sign-up">
          <Button
            onSubmit={handleLoading}
            className="group min-h-14 w-full max-w-xs rounded-xl px-6 py-4 text-base font-medium cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.15)] bg-gradient-to-r from-indigo-400 to-purple-400 opacity-90 border border-indigo-300/50 hover:opacity-100 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:border-indigo-400/60 transition-all duration-300 sm:text-lg

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

        
      </div>
    </>
  );
}
