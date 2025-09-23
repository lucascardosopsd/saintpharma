"use server";

import { createDamage } from "@/actions/damage/createDamage";
import { getUserDamage } from "@/actions/damage/getUserDamage";
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
    return prisma.exam.create({ data });
  } catch (error) {
    console.error("Erro ao criar exame:", error);
    throw new Error("Erro ao criar exame");
  }
};
