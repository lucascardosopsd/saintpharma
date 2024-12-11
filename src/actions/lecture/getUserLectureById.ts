"use server";
import prisma from "@/lib/prisma";

export const getUserLectureById = async ({
  lectureCmsId,
  userId,
}: {
  lectureCmsId: string;
  userId: string;
}) => {
  try {
    return await prisma.userLecture.findFirst({
      where: { AND: [{ lectureCmsId }, { userId }] },
    });
  } catch (error) {
    throw new Error("Error when get user lectures");
  }
};
