"use client";

import { Menu, User2Icon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Logo from "./Logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { userMenuOptions } from "@/constants/userMenuOptions";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";

interface HeaderProps {
  user: User | null;
}

const Header = ({ user }: HeaderProps) => {
  const [open, onOpenChange] = useState(false);
  const pathname = usePathname();

  const currentPath =
    pathname.split("?").length > 0 ? pathname.split("?")[0] : pathname;

  return (
    <div className="border-b border-border ">
      <div className="container flex items-center justify-between p-5 h-[8svh]">
        <Logo />

        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetTrigger>
            <Button variant="outline" size="icon" className="p-1" asChild>
              <Menu className="text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full">
            <SheetHeader className="border-b">
              <SheetTitle className="pb-2">
                <SignedOut>
                  <Link href="/sign-in" className="flex items-center gap-2">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full border">
                      <User2Icon />
                    </div>

                    <p className="font-normal">Entre com sua conta</p>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <div className="flex items-center gap-2 font-normal">
                    <Avatar>
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback></AvatarFallback>
                    </Avatar>

                    <p className="text-primary">{user?.firstName}</p>
                  </div>
                </SignedIn>
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col items-center justify-between h-full pb-10">
              <div></div>

              <div className="flex flex-col items-center justify-center gap-5 h-full">
                {userMenuOptions.map((option, index) => (
                  <Link
                    key={index}
                    href={option.href}
                    className={cn(
                      "transition",
                      option.href.split("?")[0] == currentPath &&
                        "text-primary rounded p-2",
                      option.href.split("?")[0] !== currentPath &&
                        "hover:scale-125 hover:text-primary opacity-50"
                    )}
                  >
                    <p className="text-4xl font-semibold">{option.label}</p>
                  </Link>
                ))}
              </div>

              <SignedIn>
                <SignOutButton redirectUrl="/">
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>
                    <p className="text-4xl font-semibold">Sair</p>
                  </Button>
                </SignOutButton>
              </SignedIn>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Header;
