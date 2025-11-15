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
  console.log("[createExam] INÍCIO - Recebido data:", {
    userId: data.userId,
    lectureCMSid: data.lectureCMSid,
    complete: data.complete,
    reproved: data.reproved,
  });
  try {
    // Verificar vidas disponíveis
    const userDamage = await getUserDamage({
      userId: data.userId,
      from: subHours(new Date(), 10), // Últimas 10 horas
    });

    console.log("[createExam] Danos encontrados:", userDamage.length);

    const remainingLives = defaultLifes - userDamage.length;

    if (remainingLives <= 0) {
      throw new Error(
        "Usuário não possui vidas suficientes para iniciar o exame"
      );
    }

    // Criar dano (consumir uma vida)
    // Não precisamos do retorno, apenas criar o dano
    await createDamage({ userId: data.userId });

    // Criar o exame
    // Usar select para garantir que apenas campos serializáveis sejam retornados
    const exam = await prisma.exam.create({
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
    console.log("[createExam] Exame criado no banco:", exam.id);

    // Revalidar rotas relacionadas
    // Next.js 15: Revalidar rotas específicas para garantir cache atualizado
    // Fazer revalidação de forma não bloqueante para não afetar a resposta
    revalidateRoute({ fullPath: "/" }).catch((revalidateError) => {
      console.error(
        "[createExam] Erro ao revalidar rota / (não crítico):",
        revalidateError
      );
    });
    revalidateRoute({ fullPath: `/lecture/${data.lectureCMSid}` }).catch(
      (revalidateError) => {
        console.error(
          "[createExam] Erro ao revalidar rota lecture (não crítico):",
          revalidateError
        );
      }
    );

    // Next.js 15: Serializar o objeto para garantir compatibilidade com Server Actions
    // Converter Date objects para strings ISO e garantir que todos os campos estejam presentes
    const serializedExam = {
      id: String(exam.id), // Garantir que é string
      complete: exam.complete ?? false,
      reproved: exam.reproved ?? false,
      lectureCMSid: String(exam.lectureCMSid),
      userId: String(exam.userId),
      timeLimit: exam.timeLimit ?? null,
      passingScore: exam.passingScore ?? null,
      createdAt: exam.createdAt.toISOString(),
      updatedAt: exam.updatedAt.toISOString(),
    };

    // Next.js 15: Garantir serialização completa para evitar erros de resposta inesperada
    // JSON.parse(JSON.stringify()) garante que todos os valores sejam serializáveis
    let finalResult = JSON.parse(JSON.stringify(serializedExam));

    // Remover propriedades undefined explicitamente (Next.js 15 não gosta de undefined)
    Object.keys(finalResult).forEach((key) => {
      if (finalResult[key] === undefined) {
        delete finalResult[key];
      }
    });

    // Validar que o resultado é serializável
    if (!finalResult || !finalResult.id) {
      throw new Error("Erro ao serializar exame: resultado inválido");
    }

    // Testar serialização antes de retornar
    try {
      JSON.stringify(finalResult);
    } catch (serializeError) {
      console.error(
        "[createExam] Erro ao testar serialização:",
        serializeError
      );
      throw new Error("Erro ao serializar exame: objeto não serializável");
    }

    console.log("[createExam] Exame serializado, retornando:", {
      id: finalResult.id,
      hasId: !!finalResult.id,
      keys: Object.keys(finalResult),
    });
    console.log("[createExam] FIM - Retornando resultado");
    return finalResult;
  } catch (error) {
    console.error("[createExam] ERRO CAPTURADO:", error);
    console.error("[createExam] Tipo do erro:", typeof error);
    console.error("[createExam] É Error?", error instanceof Error);
    if (error instanceof Error) {
      console.error("[createExam] Mensagem:", error.message);
      console.error("[createExam] Stack:", error.stack);
      throw error;
    }
    console.error("[createExam] Erro desconhecido, lançando erro genérico");
    throw new Error("Erro ao criar exame");
  }
};
