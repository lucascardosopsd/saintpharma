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
  nextResetTime: string | null; // Serializado como ISO string para Next.js 15
  message?: string;
};

export const checkExamEligibility = async ({
  userId,
}: CheckExamEligibilityProps): Promise<ExamEligibilityResult> => {
  console.log("[checkExamEligibility] INÍCIO - userId:", userId);
  try {
    // Buscar danos das últimas 10 horas
    console.log("[checkExamEligibility] Buscando danos do usuário...");
    const userDamage = await getUserDamage({
      userId,
      from: subHours(new Date(), 10),
    });
    console.log("[checkExamEligibility] Danos encontrados:", userDamage.length);

    const remainingLives = Math.max(0, defaultLifes - userDamage.length);
    const canTakeExam = remainingLives > 0;

    // Calcular próximo reset das vidas
    let nextResetTime: Date | null = null;
    if (userDamage.length > 0) {
      const lastDamage = userDamage[0];
      // Garantir que createdAt é um Date válido
      // Após JSON.parse(JSON.stringify()), Date vira string ISO
      let createdAt: Date;
      if (lastDamage.createdAt instanceof Date) {
        createdAt = lastDamage.createdAt;
      } else if (typeof lastDamage.createdAt === "string") {
        createdAt = new Date(lastDamage.createdAt);
      } else {
        // Fallback: usar timestamp se disponível
        createdAt = new Date(lastDamage.createdAt);
      }

      // Validar se a data é válida
      if (!isNaN(createdAt.getTime())) {
        nextResetTime = new Date(createdAt.getTime() + 10 * 60 * 60 * 1000); // 10 horas
      }
    }

    let message: string | undefined;
    if (!canTakeExam) {
      if (nextResetTime) {
        message = `Você não possui vidas disponíveis. Próximo reset: ${nextResetTime.toLocaleString("pt-BR")}`;
      } else {
        message = "Você não possui vidas disponíveis para iniciar o exame";
      }
    }

    // Next.js 15: Serializar Date para string ISO
    // Garantir serialização completa para evitar erros
    const result: ExamEligibilityResult = {
      canTakeExam,
      remainingLives,
      totalLives: defaultLifes,
      nextResetTime: nextResetTime ? nextResetTime.toISOString() : null,
      ...(message && { message }), // Apenas incluir message se existir
    };

    // Garantir serialização completa e remover undefined
    // Criar objeto limpo com apenas os campos necessários
    const serialized: ExamEligibilityResult = {
      canTakeExam: Boolean(result.canTakeExam),
      remainingLives: Number(result.remainingLives),
      totalLives: Number(result.totalLives),
      nextResetTime: result.nextResetTime ? String(result.nextResetTime) : null,
    };

    // Adicionar message apenas se existir
    if (result.message) {
      serialized.message = String(result.message);
    }

    // Testar serialização antes de retornar
    try {
      const testSerialization = JSON.stringify(serialized);
      console.log(
        "[checkExamEligibility] Serialização testada, tamanho:",
        testSerialization.length
      );
    } catch (serializeError) {
      console.error(
        "[checkExamEligibility] Erro ao testar serialização:",
        serializeError
      );
      throw new Error("Erro ao serializar resultado de elegibilidade");
    }

    console.log("[checkExamEligibility] Resultado final:", serialized);
    console.log("[checkExamEligibility] FIM - Retornando resultado");
    return serialized;
  } catch (error) {
    console.error("[checkExamEligibility] ERRO:", error);
    console.error(
      "[checkExamEligibility] Stack:",
      error instanceof Error ? error.stack : "N/A"
    );
    throw new Error("Erro ao verificar elegibilidade do exame");
  }
};
