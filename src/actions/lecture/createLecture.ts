"use server";
import prisma from "@/lib/prisma";

type NewLectureProps = {
  userId: string;
  lectureCmsId: string;
};

type CreateUserLectureProps = {
  data: NewLectureProps;
};

export const createUserLecture = async ({ data }: CreateUserLectureProps) => {
  try {
    await prisma.userLecture.create({ data });
  } catch (error) {
    throw new Error("Error when update quizzes");
  }
};
