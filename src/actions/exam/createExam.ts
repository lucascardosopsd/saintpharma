"use server";

import { createDamage } from "@/actions/damage/createDamage";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { revalidateRoute } from "@/actions/revalidateRoute";
import { defaultLifes } from "@/constants/exam";
import prisma from "@/lib/prisma";
import { subHours } from "date-fns";

type CreateExamProps = {
  data: {
    complete?: boolean;
    reproved?: boolean;
    lectureCMSid: string;
    userId: string;
    timeLimit?: number; // em minutos
    passingScore?: number; // porcentagem mínima para aprovação
  };
};

export const createExam = async ({ data }: CreateExamProps) => {
  try {
    // Verificar vidas disponíveis
    const userDamage = await getUserDamage({
      userId: data.userId,
      from: subHours(new Date(), 10), // Últimas 10 horas
    });

    const remainingLives = defaultLifes - userDamage.length;

    if (remainingLives <= 0) {
      throw new Error(
        "Usuário não possui vidas suficientes para iniciar o exame"
      );
    }

    // Criar dano (consumir uma vida)
    await createDamage({ userId: data.userId });

    // Criar o exame
    const exam = await prisma.exam.create({ data });

    // Revalidar rotas relacionadas
    await revalidateRoute({ fullPath: "/" });

    // Next.js 15: Serializar o objeto para garantir compatibilidade com Server Actions
    // Converter Date objects para strings ISO e garantir que todos os campos estejam presentes
    const serializedExam = {
      id: exam.id,
      complete: exam.complete ?? false,
      reproved: exam.reproved ?? false,
      lectureCMSid: exam.lectureCMSid,
      userId: exam.userId,
      timeLimit: exam.timeLimit ?? null,
      passingScore: exam.passingScore ?? null,
      createdAt: exam.createdAt.toISOString(),
      updatedAt: exam.updatedAt.toISOString(),
    };

    return JSON.parse(JSON.stringify(serializedExam));
  } catch (error) {
    console.error("Erro ao criar exame:", error);
    throw new Error("Erro ao criar exame");
  }
};
