import { createExam } from "@/actions/exam/createExam";
import { getExamsByUserId } from "@/actions/exam/getExamsByUserId";
import { getLectureById } from "@/actions/lecture/getLectureById";
import { getQuizByLectureId } from "@/actions/quiz/getByLectureId";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  sanitizeString,
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
  validateInput,
  validationErrorResponse,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/exams
 * Lista todos os exames do usuário
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 */
export async function GET(request: NextRequest) {
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

    // Verificar se usuário existe
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obter parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const status = searchParams.get("status"); // 'completed', 'pending', 'all'

    // Buscar exames do usuário com paginação
    const exams = await getExamsByUserId({
      userId: user.id,
      page,
      limit,
      status: status || undefined,
    });

    return successResponse({
      exams: exams.data,
      pagination: {
        page,
        limit,
        total: exams.total,
        pages: Math.ceil(exams.total / limit),
        hasNext: page * limit < exams.total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar exames:", error);
    return serverErrorResponse("Erro ao buscar exames");
  }
}

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
 *   "lectureCMSid": "string"
 * }
 *
 * Nota: Mantém compatibilidade com "lectureId" durante a transição
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
        JSON.stringify({
          error: "Header X-User-Id é obrigatório",
          code: "MISSING_USER_ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { lectureCMSid, lectureId } = body;

    // Aceita lectureCMSid (novo) ou lectureId (compatibilidade)
    const lectureIdentifier = lectureCMSid || lectureId;

    // Validação de entrada
    const validation = validateInput(body, []);
    if (!lectureIdentifier) {
      return validationErrorResponse(
        ["lectureCMSid é obrigatório"],
        "MISSING_LECTURE_ID"
      );
    }

    // Sanitizar lecture identifier
    const sanitizedLectureId = sanitizeString(lectureIdentifier);

    // Verificar se usuário existe
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Usuário não encontrado",
          code: "USER_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se a lecture existe
    const lecture = await getLectureById({ id: sanitizedLectureId });
    if (!lecture) {
      return new Response(
        JSON.stringify({
          error: "Lecture não encontrada",
          code: "LECTURE_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se existe quiz para esta lecture
    const quiz = await getQuizByLectureId({ lectureId: sanitizedLectureId });

    console.log(quiz);

    if (!quiz) {
      return new Response(
        JSON.stringify({
          error: "Quiz não encontrado para esta lecture",
          code: "QUIZ_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Criar exame
    const exam = await createExam({
      data: {
        lectureCMSid: sanitizedLectureId,
        userId: user.id,
        complete: false,
        reproved: false,
      },
    });

    return successResponse(
      {
        exam,
        quiz,
        lecture: {
          id: lecture._id,
          title: lecture.title,
        },
      },
      201
    );
  } catch (error) {
    console.error("Erro ao criar exame:", error);
    return serverErrorResponse("Erro ao criar exame");
  }
}
