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
    await prisma.userLecture.create({ data });
  } catch (error) {
    throw new Error("Error when create user lecture");
  }
};
