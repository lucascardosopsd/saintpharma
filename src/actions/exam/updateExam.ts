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
    const exam = await prisma.exam.update({ 
      where: { id }, 
      data,
      select: {
        id: true,
        complete: true,
        reproved: true,
        lectureCMSid: true,
        userId: true,
        timeLimit: true,
        passingScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Revalidar rotas relacionadas (não bloqueante)
    revalidateRoute({ fullPath: "/" }).catch((error) => {
      console.error("[updateExam] Erro ao revalidar (não crítico):", error);
    });

    // Next.js 15: Serializar objeto para garantir compatibilidade
    const serialized = {
      id: String(exam.id),
      complete: exam.complete ?? false,
      reproved: exam.reproved ?? false,
      lectureCMSid: String(exam.lectureCMSid),
      userId: String(exam.userId),
      timeLimit: exam.timeLimit ?? null,
      passingScore: exam.passingScore ?? null,
      createdAt: exam.createdAt.toISOString(),
      updatedAt: exam.updatedAt.toISOString(),
    };

    return JSON.parse(JSON.stringify(serialized));
  } catch (error) {
    console.error("[updateExam] Erro:", error);
    throw new Error("error when update exam");
  }
};
