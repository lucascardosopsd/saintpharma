import { createDamage } from "@/actions/damage/createDamage";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import { getUserLives } from "@/actions/user/getUserLives";
import { defaultLifes } from "@/constants/exam";
import {
  logAuditEvent,
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { addHours, subHours } from "date-fns";
import { NextRequest } from "next/server";

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
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buscar vidas do usuário
    const userLives = await getUserLives(user.id);

    // Buscar danos nas últimas 10 horas para detalhes
    const userDamage = await getUserDamage({
      userId: user.id,
      from: subHours(new Date(), 10),
    });

    const damageCount = userDamage.length;
    const remainingLives = Math.max(0, defaultLifes - damageCount);

    // Calculate when lives will be fully restored
    // Lives regenerate every 10 hours, so find the next reset time
    const now = new Date();
    const lastDamage = userDamage.length > 0 ? userDamage[0].createdAt : null;
    let nextResetTime: Date;

    if (lastDamage) {
      // Next reset is 10 hours after the most recent damage
      nextResetTime = addHours(lastDamage, 10);
    } else {
      // No recent damage, lives are already at full capacity
      nextResetTime = now;
    }

    return successResponse({
      userId: user.id,
      totalLives: defaultLifes,
      remainingLives,
      damageCount,
      lastDamage,
      resetTime: nextResetTime.toISOString(), // Próximo reset das vidas
      livesRegenerating: remainingLives < defaultLifes,
    });
  } catch (error) {
    console.error("Erro ao buscar vidas do usuário:", error);
    return serverErrorResponse("Erro ao buscar vidas do usuário");
  }
}

/**
 * DELETE /api/user/lives
 * Remove uma vida do usuário (cria um dano)
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Body (opcional):
 * - amount: número de vidas a remover (padrão: 1)
 */
export async function DELETE(request: NextRequest) {
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
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obter quantidade de vidas a remover do body (padrão: 1)
    let amount = 1;
    try {
      const body = await request.json();
      if (body.amount && typeof body.amount === "number" && body.amount > 0) {
        amount = Math.floor(body.amount);
      }
    } catch {
      // Se não conseguir fazer parse do JSON, usar valor padrão
    }

    // Verificar vidas atuais
    const userDamage = await getUserDamage({
      userId: user.id,
      from: subHours(new Date(), 10),
    });

    const currentDamageCount = userDamage.length;
    const remainingLives = defaultLifes - currentDamageCount;

    if (remainingLives <= 0) {
      return new Response(
        JSON.stringify({
          error: "Usuário não possui vidas para remover",
          remainingLives: 0,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Limitar a quantidade a remover pelas vidas disponíveis
    const livesToRemove = Math.min(amount, remainingLives);

    // Criar danos para remover as vidas
    const damagePromises = [];
    for (let i = 0; i < livesToRemove; i++) {
      damagePromises.push(createDamage({ userId: user.id }));
    }

    await Promise.all(damagePromises);

    // Calcular novas vidas restantes
    const newRemainingLives = Math.max(0, remainingLives - livesToRemove);

    // Calculate next reset time after removing lives
    const now = new Date();
    const nextResetTime = addHours(now, 10); // Lives will regenerate in 10 hours

    // Log de auditoria para remoção de vidas
    logAuditEvent(user.id, "REMOVE_LIVES", "user", user.id, {
      livesRemoved: livesToRemove,
      previousLives: remainingLives,
      newLives: newRemainingLives,
      totalLives: defaultLifes,
    });

    return successResponse({
      message: `${livesToRemove} vida(s) removida(s) com sucesso`,
      userId: user.id,
      livesRemoved: livesToRemove,
      totalLives: defaultLifes,
      remainingLives: newRemainingLives,
      resetTime: nextResetTime.toISOString(),
      livesRegenerating: newRemainingLives < defaultLifes,
    });
  } catch (error) {
    console.error("Erro ao remover vidas do usuário:", error);
    return serverErrorResponse("Erro ao remover vidas do usuário");
  }
}
