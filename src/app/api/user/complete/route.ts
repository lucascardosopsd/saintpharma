import { completeUserData } from "@/actions/user/completeUserData";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
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

interface RequestBody {
  lastName?: string;
  firstName?: string;
}

export async function PUT(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Validar X-User-Id
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "X-User-Id header é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse do body da requisição
    const body: RequestBody = await request.json();
    const { lastName, firstName } = body;

    // Validar se pelo menos um campo foi fornecido
    if (!lastName && !firstName) {
      return new Response(
        JSON.stringify({
          error:
            "Pelo menos um campo (lastName ou firstName) deve ser fornecido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar se lastName não está vazio
    if (lastName && lastName.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Sobrenome não pode estar vazio",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar se firstName não está vazio
    if (firstName && firstName.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "Nome não pode estar vazio",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar o usuário pelo clerkId
    const { getUserByClerkId } = await import("@/actions/user/getUserByClerk");
    const user = await getUserByClerkId(userId);

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Completar dados do usuário
    const updatedUser = await completeUserData({
      userId: user.id,
      lastName: lastName?.trim(),
      firstName: firstName?.trim(),
    });

    return successResponse({
      message: "Dados do usuário completados com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao completar dados do usuário:", error);
    return serverErrorResponse("Erro ao completar dados do usuário");
  }
}

/**
 * PUT /api/user/complete
 * Completa dados do usuário (sobrenome e/ou nome)
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * - Content-Type: application/json
 *
 * Body:
 * - lastName: string (opcional) - sobrenome do usuário
 * - firstName: string (opcional) - nome do usuário
 *
 * Exemplo de uso:
 * {
 *   "lastName": "Silva",
 *   "firstName": "João"
 * }
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "message": "Dados do usuário completados com sucesso",
 *   "user": {
 *     "id": "user_id",
 *     "clerkId": "clerk_user_id",
 *     "name": "João Silva",
 *     "email": "user@example.com",
 *     "profileImage": "image_url",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 */
