"use server";
import prisma from "@/lib/prisma";

export const getUserLectureById = async ({
  lectureCmsId,
}: {
  lectureCmsId: string;
}) => {
  try {
    return await prisma.userLecture.findFirst({ where: { lectureCmsId } });
  } catch (error) {
    throw new Error("Error when get user lectures");
  }
};
