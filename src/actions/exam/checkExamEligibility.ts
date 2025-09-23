"use server";

import { getUserDamage } from "@/actions/damage/getUserDamage";
import { defaultLifes } from "@/constants/exam";
import { subHours } from "date-fns";

type CheckExamEligibilityProps = {
  userId: string;
};

type ExamEligibilityResult = {
  canTakeExam: boolean;
  remainingLives: number;
  totalLives: number;
  nextResetTime: Date | null;
  message?: string;
};

export const checkExamEligibility = async ({
  userId,
}: CheckExamEligibilityProps): Promise<ExamEligibilityResult> => {
  try {
    // Buscar danos das últimas 10 horas
    const userDamage = await getUserDamage({
      userId,
      from: subHours(new Date(), 10),
    });

    const remainingLives = Math.max(0, defaultLifes - userDamage.length);
    const canTakeExam = remainingLives > 0;

    // Calcular próximo reset das vidas
    let nextResetTime: Date | null = null;
    if (userDamage.length > 0) {
      const lastDamage = userDamage[0];
      nextResetTime = new Date(
        lastDamage.createdAt.getTime() + 10 * 60 * 60 * 1000
      ); // 10 horas
    }

    let message: string | undefined;
    if (!canTakeExam) {
      if (nextResetTime) {
        message = `Você não possui vidas disponíveis. Próximo reset: ${nextResetTime.toLocaleString("pt-BR")}`;
      } else {
        message = "Você não possui vidas disponíveis para iniciar o exame";
      }
    }

    return {
      canTakeExam,
      remainingLives,
      totalLives: defaultLifes,
      nextResetTime,
      message,
    };
  } catch (error) {
    console.error("Erro ao verificar elegibilidade do exame:", error);
    throw new Error("Erro ao verificar elegibilidade do exame");
  }
};
