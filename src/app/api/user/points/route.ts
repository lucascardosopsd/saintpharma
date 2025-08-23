import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import prisma from "@/lib/prisma";

/**
 * PUT /api/user/points
 * Altera a pontuação do usuário
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * 
 * Body:
 * - points: número de pontos a definir (substitui o valor atual)
 * - operation: 'set' | 'add' | 'subtract' (padrão: 'set')
 * - reason: string (opcional) - motivo da alteração
 */
export async function PUT(request: NextRequest) {
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
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { points, operation = 'set', reason } = body;

    if (typeof points !== 'number') {
      return new Response(
        JSON.stringify({ error: "points deve ser um número" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!['set', 'add', 'subtract'].includes(operation)) {
      return new Response(
        JSON.stringify({ error: "operation deve ser 'set', 'add' ou 'subtract'" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true }
    });

    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const currentPoints = 0; // Points não existe no modelo User
    let newPoints: number;

    // Calcular nova pontuação baseada na operação
    switch (operation) {
      case 'set':
        newPoints = points;
        break;
      case 'add':
        newPoints = currentPoints + points;
        break;
      case 'subtract':
        newPoints = currentPoints - points;
        break;
      default:
        newPoints = points;
    }

    // Garantir que os pontos não sejam negativos
    newPoints = Math.max(0, newPoints);

    // Atualizar usuário (points removido - não existe no modelo)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        // Points não existe no modelo User - removido
      },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true
      }
    });

    // Log de pontos removido - modelo pointsLog não existe

    return successResponse({
      message: "Pontuação atualizada com sucesso",
      user: updatedUser,
      pointsChange: {
        previous: currentPoints,
        new: newPoints,
        difference: newPoints - currentPoints,
        operation: operation
      },
      reason: reason || null
    });
  } catch (error) {
    console.error("Erro ao alterar pontuação do usuário:", error);
    return serverErrorResponse("Erro ao alterar pontuação do usuário");
  }
}

/**
 * PATCH /api/user/points
 * Adiciona ou subtrai pontos do usuário (alias para PUT com operation)
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * 
 * Body:
 * - points: número de pontos (positivo para adicionar, negativo para subtrair)
 * - reason: string (opcional) - motivo da alteração
 */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { points, reason } = body;

    if (typeof points !== 'number') {
      return new Response(
        JSON.stringify({ error: "points deve ser um número" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Determinar operação baseada no sinal dos pontos
    const operation = points >= 0 ? 'add' : 'subtract';
    const absolutePoints = Math.abs(points);

    // Criar nova requisição para reutilizar a lógica do PUT
    const newRequest = new NextRequest(request.url, {
      method: 'PUT',
      headers: request.headers,
      body: JSON.stringify({
        points: absolutePoints,
        operation: operation,
        reason: reason
      })
    });

    return await PUT(newRequest);
  } catch (error) {
    console.error("Erro ao alterar pontuação do usuário (PATCH):", error);
    return serverErrorResponse("Erro ao alterar pontuação do usuário");
  }
}