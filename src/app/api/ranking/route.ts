import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getRanking } from "@/actions/ranking/get";

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
    const ranking = await getRanking();
    
    return successResponse({
      ranking,
      total: ranking.length,
      month: new Date().toISOString().slice(0, 7) // YYYY-MM format
    });
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return serverErrorResponse("Erro ao buscar ranking");
  }
}