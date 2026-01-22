"use client";

import { useSession, signOut } from "next-auth/react";

import React from "react";
import Link from "next/link";

import { Button } from "./ui/button";

import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
const Navbar = () => {
  const { data: Session } = useSession();
  const { setTheme } = useTheme();

  // const user: User = Session?.user as User;

  return (
    <nav className="p-4 md-6 shadow-md flex">
      <div className="container mx-auto flex  md:flex-row justify-between items-center">
        <Link href="/" className="text-xl font-bold mb-4 md:mb-0">
          ShadeBox
        </Link>

        <div className="space-x-8 flex">
          <div className="space-x-5 flex ">
            <Link href={"/SendMessage"}>
              <Button variant="link">
                <span className="font-bold">Send Messages</span>
              </Button>
            </Link>
          </div>

          {Session ? (
            <>
              <Button onClick={() => signOut()} className="w-full md:w-auto">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button className="w-full md:w-auto ">Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Navbar;
