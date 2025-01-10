"use client";
import { CourseProps } from "@/types/course";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type CourseCardProps = {
  course: CourseProps;
  userPoints: number;
};

const CourseCard = ({ course, userPoints }: CourseCardProps) => {
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  const disabled = userPoints <= course.premiumPoints && !!course.premiumPoints;

  const handleOpenModal = () => {
    if (disabled) {
      setOpen(true);
    }
  };

  let link = (!user && "/sign-in") || "";
  if (!disabled && user) link = `/course/${course._id}`;
  if (disabled) link = "#";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-svh">
          <div className="flex items-center justify-center flex-col">
            <DialogHeader>
              <DialogTitle className="text-center">
                Pontos insuficientes!
              </DialogTitle>
              <DialogDescription>
                <p className="text-center">
                  Você não possuiu pontos suficientes para se inscrever nesse
                  curso. Continue fazendo os cursos gratuitos e verifique o
                  ranking em "menu &gt; ranking"
                </p>
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogContent>
      </Dialog>

      <Link href={link} onClick={handleOpenModal}>
        <div className="h-[250px] w-full relative flex items-end tablet:rounded group overflow-hidden cursor-pointer rounded">
          {course.premiumPoints > 0 && (
            <span className="p-1 absolute right-5 px-4 top-5 rounded-full flex items-center justify-center bg-primary text-background font-semibold text-xs gap-1">
              <p>Premium</p>
              <p>{course.premiumPoints}</p>
            </span>
          )}

          <Image
            src={course.banner.asset.url}
            alt="Imagem curso"
            height={1000}
            width={1000}
            className={cn(
              "w-full h-full object-cover absolute -z-50 left-0 top-0 tablet:rounded group-hover:scale-125 transition-all",
              disabled && "grayscale"
            )}
          />

          <div
            className={cn(
              "h-full w-full absolute left-0 top-0 bg-gradient-to-t from-primary via-transparent to-transparent z-10 tablet:rounded"
            )}
          />

          <div className="flex justify-between text-background p-5 w-full z-50 ">
            <p className="text-semibold">{course.name}</p>
            <p className="text-semibold">{course.workload} hrs</p>
          </div>
        </div>
      </Link>
    </>
  );
};

export default CourseCard;
