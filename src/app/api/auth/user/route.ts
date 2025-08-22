import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { getUserPoints } from "@/actions/ranking/getUserPoints";
import { getUserLives } from "@/actions/user/getUserLives";

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
        JSON.stringify({ error: "Header X-User-Id é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar usuário no banco de dados
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

    // Buscar pontos e vidas do usuário
    const [userPoints, userLives] = await Promise.all([
      getUserPoints(),
      getUserLives()
    ]);

    const userData = {
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      points: userPoints,
      lives: userLives,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return successResponse(userData);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return serverErrorResponse("Erro ao buscar informações do usuário");
  }
}