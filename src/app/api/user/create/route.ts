import { createUser } from "@/actions/user/createUser";
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

interface RequestBody {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export async function POST(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Parse do body da requisição
    const body: RequestBody = await request.json();
    const { clerkId, email, firstName, lastName, profileImage } = body;

    // Validações obrigatórias
    if (!clerkId || !email) {
      return new Response(
        JSON.stringify({
          error: "clerkId e email são obrigatórios",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          error: "Formato de email inválido",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar se clerkId não está vazio
    if (clerkId.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: "ClerkId não pode estar vazio",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Criar o usuário
    const user = await createUser({
      clerkId: clerkId.trim(),
      email: email.trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      profileImage: profileImage?.trim(),
    });

    return successResponse({
      message: "Usuário criado com sucesso",
      user,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    // Verificar se é um erro de usuário já existente
    if (error instanceof Error && error.message.includes("já existe")) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return serverErrorResponse("Erro ao criar usuário");
  }
}

/**
 * POST /api/user/create
 * Cria um novo usuário no banco de dados
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - Content-Type: application/json
 *
 * Body:
 * - clerkId: string (obrigatório) - ID do usuário no Clerk
 * - email: string (obrigatório) - Email do usuário
 * - name: string (opcional) - Nome do usuário
 * - profileImage: string (opcional) - URL da imagem de perfil
 *
 * Exemplo de uso:
 * {
 *   "clerkId": "user_2abc123def456",
 *   "email": "usuario@exemplo.com",
 *   "name": "João Silva",
 *   "profileImage": "https://example.com/avatar.jpg"
 * }
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "message": "Usuário criado com sucesso",
 *   "user": {
 *     "id": "user_id",
 *     "clerkId": "user_2abc123def456",
 *     "name": "João Silva",
 *     "email": "usuario@exemplo.com",
 *     "profileImage": "https://example.com/avatar.jpg",
 *     "points": 0,
 *     "quizzes": [],
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 *
 * Resposta de erro (usuário já existe):
 * {
 *   "error": "Usuário já existe com este Clerk ID"
 * }
 */
