import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { createExam } from "@/actions/exam/createExam";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { getLectureById } from "@/actions/lecture/getLectureById";
import { getQuizByLectureId } from "@/actions/quiz/getByLectureId";

/**
 * POST /api/exams
 * Cria um novo exame para uma lecture específica
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * 
 * Body:
 * {
 *   "lectureId": "string"
 * }
 */
export async function POST(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Header X-User-Id é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { lectureId } = body;

    if (!lectureId) {
      return new Response(
        JSON.stringify({ error: "lectureId é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se usuário existe
    const user = await getUserByClerk();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se a lecture existe
    const lecture = await getLectureById({ id: lectureId });
    if (!lecture) {
      return new Response(
        JSON.stringify({ error: "Lecture não encontrada" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se existe quiz para esta lecture
    const quiz = await getQuizByLectureId({ lectureId });
    if (!quiz) {
      return new Response(
        JSON.stringify({ error: "Quiz não encontrado para esta lecture" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Criar exame
    const exam = await createExam({
      data: {
        lectureCMSid: lectureId,
        userId: user.id,
        complete: false,
        reproved: false
      }
    });

    return successResponse({
      exam,
      quiz,
      lecture: {
        id: lecture._id,
        title: lecture.title
      }
    }, 201);
  } catch (error) {
    console.error("Erro ao criar exame:", error);
    return serverErrorResponse("Erro ao criar exame");
  }
}