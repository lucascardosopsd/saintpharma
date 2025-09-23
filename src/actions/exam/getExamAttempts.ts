"use server";

import prisma from "@/lib/prisma";
import { ExamAttempt } from "@/types/exam";

type GetExamAttemptsProps = {
  examId: string;
  userId: string;
  page?: number;
  limit?: number;
};

type GetExamAttemptsResponse = {
  attempts: ExamAttempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const getExamAttempts = async ({
  examId,
  userId,
  page = 0,
  limit = 10,
}: GetExamAttemptsProps): Promise<GetExamAttemptsResponse> => {
  try {
    // Verificar se o exame pertence ao usuário
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: userId,
      },
    });

    if (!exam) {
      throw new Error("Exame não encontrado");
    }

    // Contar total de tentativas
    const total = await prisma.examAttempt.count({
      where: {
        examId: examId,
        userId: userId,
      },
    });

    // Buscar tentativas com paginação
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId: examId,
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: page * limit,
      take: limit,
    });

    // Transformar para o formato esperado
    const formattedAttempts: ExamAttempt[] = attempts.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      userId: attempt.userId,
      answers: attempt.answers as any,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      timeSpent: attempt.timeSpent,
      completedAt: attempt.completedAt || new Date(),
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
    }));

    return {
      attempts: formattedAttempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: (page + 1) * limit < total,
        hasPrev: page > 0,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar tentativas do exame:", error);
    throw new Error("Erro ao buscar tentativas do exame");
  }
};
