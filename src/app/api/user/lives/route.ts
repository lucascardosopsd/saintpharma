import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getUserLives } from "@/actions/user/getUserLives";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { defaultLifes } from "@/constants/exam";
import { subHours } from "date-fns";

/**
 * GET /api/user/lives
 * Retorna as vidas restantes do usuário
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
        JSON.stringify({ error: "Header X-User-Id é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se usuário existe
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

    // Buscar vidas do usuário
    const userLives = await getUserLives();
    
    // Buscar danos nas últimas 10 horas para detalhes
    const userDamage = await getUserDamage({
      userId: user.id,
      from: subHours(new Date(), 10)
    });

    const damageCount = userDamage.length;
    const remainingLives = defaultLifes - damageCount;

    return successResponse({
      userId: user.id,
      totalLives: defaultLifes,
      remainingLives: Math.max(0, remainingLives),
      damageCount,
      lastDamage: userDamage.length > 0 ? userDamage[0].createdAt : null,
      resetTime: subHours(new Date(), 10).toISOString() // Próximo reset das vidas
    });
  } catch (error) {
    console.error("Erro ao buscar vidas do usuário:", error);
    return serverErrorResponse("Erro ao buscar vidas do usuário");
  }
}