"use server";

import prisma from "@/lib/prisma";

type UpdateExamProps = {
  id: string;
  data: {
    complete?: boolean;
    reproved?: boolean;
    lectureCMSid?: string;
    userId: string;
  };
};

export const updateExam = async ({ data, id }: UpdateExamProps) => {
  try {
    return prisma.exam.update({ where: { id }, data });
  } catch (error) {
    throw new Error("error when create exam");
  }
};
