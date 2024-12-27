"use server";

import prisma from "@/lib/prisma";

type GetExamByIdExamProps = {
  id: string;
};

export const getExamById = async ({ id }: GetExamByIdExamProps) => {
  try {
    return prisma.exam.findFirst({ where: { id } });
  } catch (error) {
    throw new Error("error when get exam");
  }
};
