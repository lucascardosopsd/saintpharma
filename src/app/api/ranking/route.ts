import { getRanking } from "@/actions/ranking/get";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";
import { startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * GET /api/ranking
 * Retorna o ranking geral de usuários baseado nos pontos da semana atual
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 */
export async function GET(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Obter parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    const ranking = await getRanking(page, limit);

    // Calculate week boundaries for response
    const today = new Date();
    const firstDayOfWeek = startOfWeek(today, { locale: ptBR, weekStartsOn: 0 });
    const lastDayOfWeek = endOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

    return successResponse({
      ranking: ranking.data,
      pagination: {
        page,
        limit,
        total: ranking.total,
        pages: Math.ceil(ranking.total / limit),
        hasNext: page * limit < ranking.total,
        hasPrev: page > 1,
      },
      week: {
        start: firstDayOfWeek.toISOString().split('T')[0],
        end: lastDayOfWeek.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return serverErrorResponse("Erro ao buscar ranking");
  }
}
