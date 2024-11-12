"use client";

import { Menu } from "lucide-react";
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

const Header = () => {
  const pathname = usePathname();

  const currentPath =
    pathname.split("?").length > 0 ? pathname.split("?")[0] : pathname;

  return (
    <div className="border-b border-border">
      <div className="container flex items-center justify-between p-5">
        <Logo />

        <Sheet>
          <SheetTrigger>
            <Button variant="outline" size="icon" className="p-1" asChild>
              <Menu className="text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full">
            <SheetHeader className="border-b">
              <SheetTitle className="border-none text-start">Menu</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col items-center justify-between h-full py-5">
              <div></div>

              <div className="flex flex-col items-center justify-center gap-5">
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

              <Link href="/">
                <p className="text-4xl font-semibold">Sair</p>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Header;
