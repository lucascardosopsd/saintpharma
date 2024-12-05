"use server";

import prisma from "@/lib/prisma";

export const getUserLectureById = async ({ id }: { id: string }) => {
  try {
    return await prisma.userLecture.findFirst({ where: { lectureCmsId: id } });
  } catch (error) {
    console.log(error);
    throw new Error("Error when get lecture");
  }
};
