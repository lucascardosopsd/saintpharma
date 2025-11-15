"use server";

import prisma from "@/lib/prisma";

type createUserLectureProps = {
  data: {
    lectureCmsId: string;
    courseId: string;
    userId: string;
  };
};

export const createUserLecture = async ({ data }: createUserLectureProps) => {
  try {
    const userLecture = await prisma.userLecture.create({ 
      data,
      select: {
        id: true,
        lectureCmsId: true,
        courseId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Next.js 15: Retornar objeto serializado
    const serialized = {
      id: String(userLecture.id),
      lectureCmsId: String(userLecture.lectureCmsId),
      courseId: String(userLecture.courseId),
      userId: String(userLecture.userId),
      createdAt: userLecture.createdAt.toISOString(),
      updatedAt: userLecture.updatedAt.toISOString(),
    };
    
    return JSON.parse(JSON.stringify(serialized));
  } catch (error) {
    console.error("[createUserLecture] Erro:", error);
    throw new Error("Error when create user lecture");
  }
};
