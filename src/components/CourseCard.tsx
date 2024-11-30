"use client";

import { CourseProps } from "@/types/course";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { cn } from "@/lib/utils";

type CourseCardProps = {
  course: CourseProps;
  disabled?: boolean;
  points: number;
};

const CourseCard = ({ course, points, disabled }: CourseCardProps) => {
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => {
    if (disabled) {
      setOpen(true);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <div className="w-[90svw] h-svh flex items-center justify-center flex-col">
            <AlertDialogHeader>
              <AlertDialogTitle>Pontos insuficientes!</AlertDialogTitle>
              <AlertDialogDescription>
                Você não possuiu pontos suficientes para se inscrever nesse
                curso. Continue fazendo os cursos gratuitos e verifique o
                ranking em "menu &gt; ranking"
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-2xl h-12 w-64">
                Fechar
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Link
        href={!disabled ? `/course/${course._id}` : ""}
        onClick={handleOpenModal}
      >
        <div className="h-[250px] w-full relative flex items-end tablet:rounded group overflow-hidden cursor-pointer">
          {course.premiumPoints > 0 && (
            <span className="p-1 absolute right-5 px-4 top-5 rounded-full flex items-center justify-center bg-primary text-background font-semibold text-xs gap-1">
              <p>Premium</p>
              <p>{points}</p>
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
              "h-full w-full absolute left-0 top-0 bg-gradient-to-t from-primary to-transparent z-10 tablet:rounded",
              disabled && "from-transparent"
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
