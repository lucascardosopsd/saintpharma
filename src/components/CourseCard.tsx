"use client";
import { CourseProps } from "@/types/course";
import { CourseProgress } from "@/actions/courses/getCoursesProgress";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Progress } from "./ui/progress";
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
  progress?: CourseProgress;
};

const CourseCard = ({ course, userPoints, progress }: CourseCardProps) => {
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  const disabled = userPoints <= course.premiumPoints && !!course.premiumPoints;
  
  const showProgress = progress && progress.totalLectures > 0;

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
        <div className={cn(
          "h-[280px] w-full relative flex items-end rounded-xl group overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300",
          disabled && "opacity-60"
        )}>
          {course.premiumPoints > 0 && (
            <span className="absolute right-4 top-4 px-3 py-1.5 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-xs gap-1 shadow-md z-20">
              <p>Premium</p>
              <p>{course.premiumPoints}</p>
            </span>
          )}

          <Image
            src={course.banner.asset.url}
            alt={`Banner do curso ${course.name}`}
            height={1000}
            width={1000}
            className={cn(
              "w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-500",
              disabled && "grayscale"
            )}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent z-10" />

          <div className="relative z-20 w-full p-5">
            <div className="flex justify-between items-start gap-3 mb-2">
              <p className="font-bold text-lg text-primary-foreground leading-tight flex-1">
                {course.name}
              </p>
              <span className="flex-shrink-0 px-2 py-1 rounded-md bg-primary-foreground/20 text-primary-foreground text-xs font-semibold">
                {course.workload} hrs
              </span>
            </div>
            {showProgress && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary-foreground/80 font-medium">
                    {progress.isCompleted ? (
                      <span className="flex items-center gap-1">
                        <span>✓ Concluído</span>
                      </span>
                    ) : (
                      `${progress.completedCount} de ${progress.totalLectures} aulas`
                    )}
                  </span>
                  <span className="text-primary-foreground/80 font-semibold">
                    {progress.progressPercentage}%
                  </span>
                </div>
                <Progress 
                  value={progress.progressPercentage} 
                  className="h-1.5 bg-primary-foreground/20 border border-primary-foreground/30"
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </>
  );
};

export default CourseCard;
