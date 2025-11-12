"use server";
import prisma from "@/lib/prisma";
import { getUserFullName } from "@/lib/userName";
import { endOfWeek, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

type UserRanking = {
  userId: string;
  name: string;
  points: number;
  profileImage: string;
  position: number;
};

export const getRanking = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  // Get all users (we need to calculate weekly points for all)
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImage: true,
    },
  });

  // Calculate week boundaries
  const today = new Date();
  const firstDayOfWeek = startOfWeek(today, { locale: ptBR, weekStartsOn: 0 });
  const lastDayOfWeek = endOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

  // Calculate weekly points for each user
  const usersWithWeekPoints = await Promise.all(
    allUsers.map(async (user) => {
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

      const weekPoints = certificatePoints + examPoints + lecturePoints;

      return {
        ...user,
        points: weekPoints,
      };
    })
  );

  // Filter out users with 0 points (only show users who earned points this week)
  const usersWithPoints = usersWithWeekPoints.filter((user) => user.points > 0);

  // Sort by weekly points descending
  usersWithPoints.sort((a, b) => b.points - a.points);

  // Get total count for pagination (only users with points)
  const total = usersWithPoints.length;

  // Get paginated users
  const paginatedUsers = usersWithPoints.slice(skip, skip + limit);

  // Transform to ranking format
  const ranking: UserRanking[] = paginatedUsers.map((user, index) => ({
    userId: user.id,
    name: getUserFullName(user),
    points: user.points || 0,
    profileImage: user.profileImage || "",
    position: skip + index + 1, // Calculate actual position in ranking
  }));

  return {
    data: ranking,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};
