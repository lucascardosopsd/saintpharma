"use server";
import prisma from "@/lib/prisma";
import { endOfWeek, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getUserByClerk, getUserByClerkId } from "../user/getUserByClerk";

export const getWeekPoints = async (userId?: string) => {
  const user = userId ? await getUserByClerkId(userId) : await getUserByClerk();

  if (!user?.id) {
    return 0;
  }

  const today = new Date();
  const firstDayOfWeek = startOfWeek(today, { locale: ptBR, weekStartsOn: 0 });
  const lastDayOfWeek = endOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

  // Get certificates earned this week
  const certificates = await prisma.certificate.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: firstDayOfWeek,
        lte: lastDayOfWeek,
      },
    },
    select: { points: true },
  });

  // Get exams completed this week (each completed exam gives 10 points)
  const completedExams = await prisma.exam.findMany({
    where: {
      userId: user.id,
      complete: true,
      createdAt: {
        gte: firstDayOfWeek,
        lte: lastDayOfWeek,
      },
    },
    select: { id: true },
  });

  // Get lectures completed this week (each completed lecture gives 5 points)
  const completedLectures = await prisma.userLecture.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: firstDayOfWeek,
        lte: lastDayOfWeek,
      },
    },
    select: { id: true },
  });

  const certificatePoints = certificates.reduce(
    (acc, cert) => acc + cert.points,
    0
  );
  const examPoints = completedExams.length * 10; // 10 points per completed exam
  const lecturePoints = completedLectures.length * 5; // 5 points per completed lecture

  return certificatePoints + examPoints + lecturePoints;
};
