"use client";
import { CircleDashed, Heart, Menu, User2Icon } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from "react";
import { getClerkUser } from "@/actions/user/getClerkUser";
import { User } from "@clerk/nextjs/server";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { subHours } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { defaultLifes } from "@/constants/exam";
import { toast } from "sonner";
import { revalidateRoute } from "@/actions/revalidateRoute";

const Header = () => {
  const [user, setUser] = useState({} as User);
  const [damage, setDamage] = useState<null | number>(null);
  const [open, onOpenChange] = useState(false);
  const pathname = usePathname();

  const currentPath =
    pathname.split("?").length > 0 ? pathname.split("?")[0] : pathname;

  const getData = async () => {
    try {
      getClerkUser().then((data) => setUser(data));

      const user = await getUserByClerk();
      const userDamage = await getUserDamage({
        userId: user?.id!,
        from: subHours(new Date(), 10),
      });

      setDamage(userDamage.length);
    } catch (error) {
      toast.error("Erro ao carregar dados do cabeçalho");
    }
  };

  useEffect(() => {
    getData();
    revalidateRoute({ fullPath: "/" });
  }, []);

  return (
    <div className="border-b border-border">
      <div className="container flex items-center justify-between py-2 px-5 h-[8svh]">
        <Logo />

        <div className="flex items-center gap-2">
          {user && (
            <>
              {damage !== null ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="text-red-500" variant="outline">
                      <p>{defaultLifes - damage!}</p>
                      <Heart className="fill-red-500 stroke-red-500" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="h-svh items-center">
                    <div>
                      <div className="flex gap-2 justify-center">
                        <p className="text-center">Vidas</p>
                        <Heart className="fill-red-500 stroke-red-500" />
                      </div>
                      <p className="text-center">
                        Esse é o total de vidas que ainda restam para tentar
                        realizar as provas novamente. Cada vida demora 12 horas
                        para ser restaurantada e ao final de todas as vidas você
                        fica impedido de realizar uma nova tentativa até que ao
                        menos uma se restaure.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <CircleDashed className="animate-spin text-red-500" />
              )}
            </>
          )}

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
    </div>
  );
};

export default Header;
