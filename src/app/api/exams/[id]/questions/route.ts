import { getExamWithQuestions } from "@/actions/exam/getExamWithQuestions";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/exams/[id]/questions
 * Retorna um exame com suas perguntas e respostas
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Path Parameters:
 * - id: ID do exame
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
    const { id: examId } = params;
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

    if (!examId) {
      return new Response(
        JSON.stringify({
          error: "ID do exame é obrigatório",
          code: "MISSING_EXAM_ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    // Buscar exame com perguntas
    const examWithQuestions = await getExamWithQuestions({
      examId,
      userId: user.id,
    });

    if (!examWithQuestions) {
      return new Response(
        JSON.stringify({
          error: "Exame não encontrado",
          code: "EXAM_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return successResponse({
      exam: examWithQuestions,
    });
  } catch (error) {
    console.error("Erro ao buscar exame com perguntas:", error);
    return serverErrorResponse("Erro ao buscar exame com perguntas");
  }
}
