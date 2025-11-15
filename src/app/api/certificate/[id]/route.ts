import { getCertificateById } from "@/actions/certification/getById";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * GET /api/certificate/[id]
 * Retorna um certificado específico por ID
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Path Parameters:
 * - id: ID do certificado
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Next.js 15: params agora é uma Promise e precisa ser aguardado
    const { id: certificateId } = await params;
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

    if (!certificateId) {
      return new Response(
        JSON.stringify({
          error: "ID do certificado é obrigatório",
          code: "MISSING_CERTIFICATE_ID",
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

    // Buscar certificado
    const certificate = await getCertificateById({ id: certificateId });

    if (!certificate) {
      return new Response(
        JSON.stringify({
          error: "Certificado não encontrado",
          code: "CERTIFICATE_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o certificado pertence ao usuário
    if (certificate.userId !== user.id) {
      return new Response(
        JSON.stringify({
          error: "Acesso negado ao certificado",
          code: "FORBIDDEN",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return successResponse({
      certificate,
    });
  } catch (error) {
    console.error("Erro ao buscar certificado:", error);
    return serverErrorResponse("Erro ao buscar certificado");
  }
}
