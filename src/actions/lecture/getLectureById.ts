import prisma from "@/lib/prisma";

export const getUserLectureById = async ({ id }: { id: string }) => {
  try {
    return await prisma.userLecture.findFirst({ where: { id } });
  } catch (error) {
    throw new Error("Error when update quizzes");
  }
};
