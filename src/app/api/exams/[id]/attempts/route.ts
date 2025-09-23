import { getExamAttempts } from "@/actions/exam/getExamAttempts";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/exams/[id]/attempts
 * Retorna tentativas de um exame
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Path Parameters:
 * - id: ID do exame
 *
 * Query Parameters:
 * - page: Número da página (padrão: 0)
 * - limit: Itens por página (padrão: 10, máximo: 50)
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

    // Obter parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    // Buscar tentativas do exame
    const attemptsData = await getExamAttempts({
      examId,
      userId: user.id,
      page,
      limit,
    });

    return successResponse(attemptsData);
  } catch (error) {
    console.error("Erro ao buscar tentativas do exame:", error);
    return serverErrorResponse("Erro ao buscar tentativas do exame");
  }
}
