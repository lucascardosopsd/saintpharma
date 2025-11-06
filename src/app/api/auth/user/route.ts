import { getUserPoints } from "@/actions/ranking/getUserPoints";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import { getUserLives } from "@/actions/user/getUserLives";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/auth/user
 * Retorna informações do usuário autenticado
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id> (ID do usuário no Clerk)
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

    // Buscar usuário no banco de dados pelo clerkId
    const user = await getUserByClerkId(userId);

    console.log("user", user);

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

    // Buscar pontos e vidas do usuário
    const [userPoints, userLives] = await Promise.all([
      getUserPoints(user.id),
      getUserLives(user.id),
    ]);

    const userData = {
      id: user.id,
      clerkId: user.clerkId,
        name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || "Usuário",
      email: user.email,
      profileImage: user.profileImage,
      points: userPoints,
      lives: userLives,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse(userData);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return serverErrorResponse("Erro ao buscar informações do usuário");
  }
}
