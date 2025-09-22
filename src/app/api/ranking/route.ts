import { getRanking } from "@/actions/ranking/get";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/ranking
 * Retorna o ranking geral de usuários baseado nos pontos do mês atual
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
      month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    });
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return serverErrorResponse("Erro ao buscar ranking");
  }
}
