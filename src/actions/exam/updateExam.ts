"use server";

import { revalidateRoute } from "@/actions/revalidateRoute";
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
    const exam = await prisma.exam.update({ where: { id }, data });

    // Revalidar rotas relacionadas
    await revalidateRoute({ fullPath: "/" });

    return exam;
  } catch (error) {
    throw new Error("error when update exam");
  }
};
