import { getUserCertificates } from "@/actions/certification/getUserCertificates";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/certificate
 * Lista todos os certificados do usuário
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Query Parameters (opcionais):
 * - page: Número da página (padrão: 0)
 * - limit: Itens por página (padrão: 20, máximo: 100)
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
        JSON.stringify({
          error: "Header X-User-Id é obrigatório",
          code: "MISSING_USER_ID",
        }),
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
        JSON.stringify({
          error: "Usuário não encontrado",
          code: "USER_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obter parâmetros de paginação
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    // Buscar certificados do usuário
    const certificates = await getUserCertificates({ userId: user.id });

    // Aplicar paginação manualmente (já que a função não suporta paginação)
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedCertificates = certificates.slice(startIndex, endIndex);

    return successResponse({
      certificates: paginatedCertificates,
      pagination: {
        page,
        limit,
        total: certificates.length,
        pages: Math.ceil(certificates.length / limit),
        hasNext: endIndex < certificates.length,
        hasPrev: page > 0,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar certificados:", error);
    return serverErrorResponse("Erro ao buscar certificados do usuário");
  }
}
