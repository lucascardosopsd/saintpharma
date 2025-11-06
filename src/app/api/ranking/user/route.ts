import { getUserPoints } from "@/actions/ranking/getUserPoints";
import { getWeekPoints } from "@/actions/ranking/getWeekPoints";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/ranking/user
 * Retorna os pontos do usuário (total e da semana)
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

    // Buscar pontos do usuário
    const [totalPoints, weekPoints] = await Promise.all([
      getUserPoints(user.id),
      getWeekPoints(user.id),
    ]);

    return successResponse({
      userId: user.id,
      userName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || "Usuário",
      totalPoints,
      weekPoints,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Erro ao buscar pontos do usuário:", error);
    return serverErrorResponse("Erro ao buscar pontos do usuário");
  }
}
