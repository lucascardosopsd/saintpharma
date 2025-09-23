"use server";

import { revalidateRoute } from "@/actions/revalidateRoute";
import prisma from "@/lib/prisma";

type DeleteExamProps = {
  id: string;
};

export const deleteExam = async ({ id }: DeleteExamProps) => {
  try {
    const exam = await prisma.exam.delete({ where: { id } });

    // Revalidar rotas relacionadas
    await revalidateRoute({ fullPath: "/" });

    return exam;
  } catch (error) {
    throw new Error("error when delete exam");
  }
};
