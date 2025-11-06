import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import { updateUser } from "@/actions/user/updateUser";
import {
  sanitizeString,
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
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  points?: number;
  quizzes?: string[];
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

    // Buscar o usuário pelo clerkId
    const user = await getUserByClerkId(userId);

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse do body da requisição
    const body: RequestBody = await request.json();
    const { firstName, lastName, email, profileImage, points, quizzes } = body;

    // Validar se pelo menos um campo foi fornecido
    if (!firstName && !lastName && !email && !profileImage && points === undefined && !quizzes) {
      return new Response(
        JSON.stringify({
          error: "Pelo menos um campo deve ser fornecido para atualização",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    // Validar e sanitizar firstName
    if (firstName !== undefined) {
      if (firstName.trim().length === 0) {
        return new Response(
          JSON.stringify({
            error: "Primeiro nome não pode estar vazio",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      updateData.firstName = sanitizeString(firstName);
    }

    // Validar e sanitizar lastName
    if (lastName !== undefined) {
      updateData.lastName = lastName.trim().length > 0 ? sanitizeString(lastName) : null;
    }

    // Validar email
    if (email !== undefined) {
      if (email.trim().length === 0) {
        return new Response(
          JSON.stringify({
            error: "Email não pode estar vazio",
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
      updateData.email = email.trim();
    }

    // Validar e sanitizar profileImage
    if (profileImage !== undefined) {
      if (profileImage.trim().length === 0) {
        updateData.profileImage = null;
      } else {
        updateData.profileImage = sanitizeString(profileImage);
      }
    }

    // Validar pontos
    if (points !== undefined) {
      if (typeof points !== "number" || points < 0) {
        return new Response(
          JSON.stringify({
            error: "Pontos devem ser um número não negativo",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      updateData.points = points;
    }

    // Validar quizzes
    if (quizzes !== undefined) {
      if (!Array.isArray(quizzes)) {
        return new Response(
          JSON.stringify({
            error: "Quizzes deve ser um array",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Validar se todos os elementos são strings
      if (!quizzes.every((quiz) => typeof quiz === "string")) {
        return new Response(
          JSON.stringify({
            error: "Todos os quizzes devem ser strings",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      updateData.quizzes = quizzes.map((quiz) => sanitizeString(quiz));
    }

    // Atualizar o usuário
    await updateUser({
      userId: user.id,
      data: updateData,
    });

    // Buscar o usuário atualizado
    const updatedUser = await getUserByClerkId(userId);

    return successResponse({
      message: "Usuário atualizado com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    // Verificar se é um erro de email duplicado
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return new Response(
        JSON.stringify({
          error: "Email já está em uso por outro usuário",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return serverErrorResponse("Erro ao atualizar usuário");
  }
}

/**
 * PUT /api/user/update
 * Atualiza informações do usuário
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * - Content-Type: application/json
 *
 * Body (todos os campos são opcionais):
 * - name: string - Nome do usuário
 * - email: string - Email do usuário
 * - profileImage: string - URL da imagem de perfil
 * - points: number - Pontuação do usuário
 * - quizzes: string[] - Array de IDs de quizzes
 *
 * Exemplo de uso:
 * {
 *   "name": "João Silva Santos",
 *   "email": "novoemail@exemplo.com",
 *   "profileImage": "https://example.com/new-avatar.jpg",
 *   "points": 150,
 *   "quizzes": ["quiz1", "quiz2", "quiz3"]
 * }
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "message": "Usuário atualizado com sucesso",
 *   "user": {
 *     "id": "user_id",
 *     "clerkId": "clerk_user_id",
 *     "name": "João Silva Santos",
 *     "email": "novoemail@exemplo.com",
 *     "profileImage": "https://example.com/new-avatar.jpg",
 *     "points": 150,
 *     "quizzes": ["quiz1", "quiz2", "quiz3"],
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   }
 * }
 *
 * Resposta de erro (email duplicado):
 * {
 *   "error": "Email já está em uso por outro usuário"
 * }
 */
