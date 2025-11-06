import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { getUserFullName } from "@/lib/userName";
import { NextRequest } from "next/server";

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Obter clerkId dos parâmetros da query ou do header
    const { searchParams } = new URL(request.url);
    const clerkId =
      searchParams.get("clerkId") || request.headers.get("X-User-Id");

    if (!clerkId) {
      return new Response(
        JSON.stringify({
          error:
            "clerkId é obrigatório (via query parameter ou header X-User-Id)",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar o usuário
    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Retornar perfil completo do usuário
    return successResponse({
      message: "Perfil do usuário encontrado com sucesso",
      profile: {
        id: user.id,
        clerkId: user.clerkId,
        name: getUserFullName(user),
        email: user.email,
        profileImage: user.profileImage,
        points: user.points,
        quizzes: user.quizzes,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return serverErrorResponse("Erro ao buscar perfil do usuário");
  }
}

/**
 * GET /api/user/profile
 * Busca o perfil completo de um usuário pelo Clerk ID
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id> (opcional, se não fornecido via query)
 *
 * Query parameters:
 * - clerkId: string (opcional, se não fornecido via header)
 *
 * Exemplo de uso:
 * GET /api/user/profile?clerkId=user_2abc123def456
 * ou
 * GET /api/user/profile (com header X-User-Id: user_2abc123def456)
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "message": "Perfil do usuário encontrado com sucesso",
 *   "profile": {
 *     "id": "user_id",
 *     "clerkId": "user_2abc123def456",
 *     "name": "João Silva",
 *     "email": "usuario@exemplo.com",
 *     "profileImage": "https://example.com/avatar.jpg",
 *     "points": 100,
 *     "quizzes": ["quiz1", "quiz2"],
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 *
 * Resposta de erro:
 * {
 *   "error": "Usuário não encontrado"
 * }
 */
