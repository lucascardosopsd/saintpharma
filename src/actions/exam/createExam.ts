"use server";

import prisma from "@/lib/prisma";

type CreateExamProps = {
  data: {
    complete?: boolean;
    reproved?: boolean;
    lectureCMSid: string;
    userId: string;
  };
};

export const createExam = async ({ data }: CreateExamProps) => {
  try {
    return prisma.exam.create({ data });
  } catch (error) {
    throw new Error("error when create exam");
  }
};
