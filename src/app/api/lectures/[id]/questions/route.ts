import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getQuizByLectureId } from "@/actions/quiz/getByLectureId";
import { getLectureById } from "@/actions/lecture/getLectureById";
import { QuestionResponse, Question } from "@/types/questionResponse";

/**
 * GET /api/lectures/[id]/questions
 * Retorna as questões de uma aula específica no formato QuestionResponse
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * 
 * Parâmetros:
 * - id: ID da aula
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id: lectureId } = params;
    
    if (!lectureId) {
      return new Response(
        JSON.stringify({ error: "ID da aula é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se a aula existe
    const lecture = await getLectureById({ id: lectureId });
    if (!lecture) {
      return new Response(
        JSON.stringify({ error: "Aula não encontrada" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar quiz da aula
    const quiz = await getQuizByLectureId({ lectureId });
    if (!quiz) {
      return new Response(
        JSON.stringify({ error: "Quiz não encontrado para esta aula" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Mapear questões para o formato da interface QuestionResponse
    const questions: Question[] = quiz.questions.map(question => ({
      title: question.title,
      question: question.question,
      cover: question.cover,
      answers: question.answers.map(answer => ({
        answer: answer.answer,
        isCorrect: answer.isCorrect
      }))
    }));

    // Montar resposta no formato QuestionResponse
    const response: QuestionResponse = {
      questions,
      totalQuestions: questions.length,
      timeLimit: 30, // Valor padrão de 30 minutos - pode ser configurável
      passingScore: 70 // Valor padrão de 70% - pode ser configurável
    };

    return successResponse(response);
  } catch (error) {
    console.error("Erro ao buscar questões da aula:", error);
    return serverErrorResponse("Erro ao buscar questões da aula");
  }
}