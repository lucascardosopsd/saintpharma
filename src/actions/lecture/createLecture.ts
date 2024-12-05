"use server";
import prisma from "@/lib/prisma";

type NewLectureProps = {
  lectureCmsId: string;
  courseId: string;
  userId: string;
};

type CreateUserLectureProps = {
  data: NewLectureProps;
};

export const createUserLecture = async ({ data }: CreateUserLectureProps) => {
  try {
    await prisma.userLecture.create({ data });
  } catch (error) {
    console.log(error);
    throw new Error("Error when create user lecture");
  }
};
