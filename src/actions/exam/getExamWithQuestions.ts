"use server";

import { getLectureById } from "@/actions/lecture/getLectureById";
import { getQuizByLectureId } from "@/actions/quiz/getByLectureId";
import prisma from "@/lib/prisma";
import { ExamQuestion, ExamWithQuestions } from "@/types/exam";

type GetExamWithQuestionsProps = {
  examId: string;
  userId: string;
};

export const getExamWithQuestions = async ({
  examId,
  userId,
}: GetExamWithQuestionsProps): Promise<ExamWithQuestions | null> => {
  try {
    // Buscar o exame
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        userId: userId,
      },
    });

    if (!exam) {
      return null;
    }

    // Buscar o quiz da lecture
    const quiz = await getQuizByLectureId({ lectureId: exam.lectureCMSid });

    if (!quiz || !quiz.questions) {
      return null;
    }

    // Buscar detalhes da lecture
    const lecture = await getLectureById({ id: exam.lectureCMSid });

    if (!lecture) {
      return null;
    }

    // Transformar as perguntas do quiz no formato esperado
    const questions: ExamQuestion[] = quiz.questions.map(
      (question: any, index: number) => ({
        id: question._id || `question_${index}`,
        title: question.title || `Pergunta ${index + 1}`,
        question: question.question || "",
        cover: question.cover,
        answers:
          question.answers?.map((answer: any) => ({
            answer: answer.answer || "",
            isCorrect: answer.isCorrect || false,
          })) || [],
        order: index + 1,
      })
    );

    return {
      id: exam.id,
      lectureCMSid: exam.lectureCMSid,
      userId: exam.userId,
      complete: exam.complete || false,
      reproved: exam.reproved || false,
      questions,
      totalQuestions: questions.length,
      timeLimit: exam.timeLimit || undefined,
      passingScore: exam.passingScore || undefined,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    };
  } catch (error) {
    console.error("Erro ao buscar exame com perguntas:", error);
    throw new Error("Erro ao buscar exame com perguntas");
  }
};
