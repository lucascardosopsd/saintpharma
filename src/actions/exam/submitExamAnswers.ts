"use server";

import prisma from "@/lib/prisma";
import { ExamAnswer, ExamResult } from "@/types/exam";

type SubmitExamAnswersProps = {
  examId: string;
  userId: string;
  answers: {
    questionId: string;
    selectedAnswer: string;
  }[];
  timeSpent: number; // em segundos
};

export const submitExamAnswers = async ({
  examId,
  userId,
  answers,
  timeSpent,
}: SubmitExamAnswersProps): Promise<ExamResult> => {
  try {
    // Buscar o exame
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: userId,
      },
    });

    if (!exam) {
      throw new Error("Exame não encontrado");
    }

    // Buscar o quiz para validar as respostas
    const { getQuizByLectureId } = await import(
      "@/actions/quiz/getByLectureId"
    );
    const quiz = await getQuizByLectureId({ lectureId: exam.lectureCMSid });

    if (!quiz || !quiz.questions) {
      throw new Error("Quiz não encontrado");
    }

    // Processar respostas e calcular pontuação
    const processedAnswers: ExamAnswer[] = [];
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;

    for (const userAnswer of answers) {
      // Encontrar a pergunta correspondente
      const question = quiz.questions.find(
        (q: any) =>
          q._id === userAnswer.questionId || 
          q.title === userAnswer.questionId ||
          `question_${quiz.questions.indexOf(q)}` === userAnswer.questionId
      );

      if (!question) {
        console.error('Pergunta não encontrada:', userAnswer.questionId);
        continue;
      }

      // Encontrar a resposta correta
      const correctAnswer = question.answers?.find(
        (answer: any) => answer.isCorrect
      );
      
      // Comparar respostas removendo espaços extras e normalizando
      const normalizedCorrectAnswer = correctAnswer?.answer?.trim();
      const normalizedUserAnswer = userAnswer.selectedAnswer?.trim();
      const isCorrect = normalizedCorrectAnswer === normalizedUserAnswer;

      // Log para debug
      console.log('Validando resposta:', {
        questionId: userAnswer.questionId,
        questionTitle: question.title,
        userAnswer: normalizedUserAnswer,
        correctAnswer: normalizedCorrectAnswer,
        isCorrect
      });

      if (isCorrect) {
        correctAnswers++;
      }

      processedAnswers.push({
        questionId: userAnswer.questionId,
        selectedAnswer: userAnswer.selectedAnswer,
        isCorrect,
        timeSpent: Math.floor(timeSpent / totalQuestions), // tempo médio por pergunta
      });
    }

    // Calcular pontuação
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passingScore = exam.passingScore || 70; // 70% por padrão
    const passed = score >= passingScore;

    // Criar tentativa do exame
    const examAttempt = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        userId: userId,
        answers: processedAnswers as any, // JSON field
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        timeSpent: timeSpent,
        passed: passed,
        completedAt: new Date(),
      },
    });

    // Atualizar o exame como concluído
    await prisma.exam.update({
      where: { id: exam.id },
      data: {
        complete: true,
        reproved: !passed,
      },
    });

    // Se passou, adicionar pontos
    if (passed) {
      const examPoints = 10; // 10 pontos por exame aprovado
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: examPoints,
          },
        },
      });
    } else {
      // Se reprovou, não fazer nada com as vidas (já foram consumidas na criação)
      // O usuário pode tentar novamente quando tiver vidas disponíveis
    }

    return {
      examId: exam.id,
      score: score,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      passed: passed,
      timeSpent: timeSpent,
      answers: processedAnswers,
      completedAt: examAttempt.completedAt || new Date(),
    };
  } catch (error) {
    console.error("Erro ao submeter respostas do exame:", error);
    throw new Error("Erro ao submeter respostas do exame");
  }
};
