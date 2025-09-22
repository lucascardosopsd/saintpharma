"use server";

import prisma from "@/lib/prisma";

type DeleteExamProps = {
  id: string;
};

export const deleteExam = async ({ id }: DeleteExamProps) => {
  try {
    return prisma.exam.delete({ where: { id } });
  } catch (error) {
    throw new Error("error when delete exam");
  }
};