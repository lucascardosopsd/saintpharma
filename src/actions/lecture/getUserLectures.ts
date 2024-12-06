"use server";
import prisma from "@/lib/prisma";

export const getUserLectures = async ({ userId }: { userId: string }) => {
  try {
    return await prisma.userLecture.findMany({ where: { userId } });
  } catch (error) {
    throw new Error("Error when get user lectures");
  }
};
