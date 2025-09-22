"use server";

import prisma from "@/lib/prisma";

type GetExamsByUserIdProps = {
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
};

export const getExamsByUserId = async ({
  userId,
  page = 1,
  limit = 20,
  status,
}: GetExamsByUserIdProps) => {
  try {
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { userId };

    if (status === "completed") {
      whereClause.complete = true;
    } else if (status === "pending") {
      whereClause.complete = false;
    }

    // Get total count for pagination
    const total = await prisma.exam.count({ where: whereClause });

    // Get paginated results
    const exams = await prisma.exam.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        complete: true,
        reproved: true,
        lectureCMSid: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: exams,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error("error when get exams by user id");
  }
};
