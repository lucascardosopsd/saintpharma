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

interface UserData {
  clerkId: string;
  email: string;
  name?: string;
  profileImage?: string;
}

interface RequestBody {
  users: UserData[];
}

export async function POST(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Parse do body da requisição
    const body: RequestBody = await request.json();
    const { users } = body;

    // Validações
    if (!users || !Array.isArray(users)) {
      return new Response(
        JSON.stringify({
          error: "Campo 'users' deve ser um array",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (users.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Array de usuários não pode estar vazio",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (users.length > 100) {
      return new Response(
        JSON.stringify({
          error: "Máximo de 100 usuários por requisição",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validar cada usuário
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (!user.clerkId || !user.email) {
        return new Response(
          JSON.stringify({
            error: `Usuário na posição ${i}: clerkId e email são obrigatórios`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (!emailRegex.test(user.email)) {
        return new Response(
          JSON.stringify({
            error: `Usuário na posição ${i}: formato de email inválido`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (user.clerkId.trim().length === 0) {
        return new Response(
          JSON.stringify({
            error: `Usuário na posição ${i}: clerkId não pode estar vazio`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Criar usuários
    const results = {
      created: [] as any[],
      errors: [] as any[],
    };

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];

      try {
        // Dividir name em firstName e lastName se fornecido
        let firstName: string | undefined;
        let lastName: string | undefined;
        
        if (userData.name) {
          const nameParts = userData.name.trim().split(/\s+/);
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(" ").trim() || undefined;
        }

        const user = await createUser({
          clerkId: userData.clerkId.trim(),
          email: userData.email.trim(),
          firstName: firstName,
          lastName: lastName,
          profileImage: userData.profileImage?.trim(),
        });

        results.created.push({
          index: i,
          user,
        });
      } catch (error) {
        results.errors.push({
          index: i,
          userData: {
            clerkId: userData.clerkId,
            email: userData.email,
          },
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return successResponse({
      message: `Processamento concluído: ${results.created.length} criados, ${results.errors.length} com erro`,
      results,
    });
  } catch (error) {
    console.error("Erro ao criar usuários em lote:", error);
    return serverErrorResponse("Erro ao criar usuários em lote");
  }
}

/**
 * POST /api/user/bulk-create
 * Cria múltiplos usuários no banco de dados
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - Content-Type: application/json
 *
 * Body:
 * - users: array (obrigatório) - Array de objetos de usuário
 *   - clerkId: string (obrigatório) - ID do usuário no Clerk
 *   - email: string (obrigatório) - Email do usuário
 *   - name: string (opcional) - Nome do usuário
 *   - profileImage: string (opcional) - URL da imagem de perfil
 *
 * Exemplo de uso:
 * {
 *   "users": [
 *     {
 *       "clerkId": "user_2abc123def456",
 *       "email": "usuario1@exemplo.com",
 *       "name": "João Silva"
 *     },
 *     {
 *       "clerkId": "user_2def456ghi789",
 *       "email": "usuario2@exemplo.com",
 *       "name": "Maria Santos",
 *       "profileImage": "https://example.com/avatar2.jpg"
 *     }
 *   ]
 * }
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "message": "Processamento concluído: 2 criados, 0 com erro",
 *   "results": {
 *     "created": [
 *       {
 *         "index": 0,
 *         "user": {
 *           "id": "user_id_1",
 *           "clerkId": "user_2abc123def456",
 *           "name": "João Silva",
 *           "email": "usuario1@exemplo.com",
 *           "points": 0,
 *           "quizzes": [],
 *           "createdAt": "2024-01-01T00:00:00.000Z",
 *           "updatedAt": "2024-01-01T00:00:00.000Z"
 *         }
 *       }
 *     ],
 *     "errors": []
 *   }
 * }
 */
