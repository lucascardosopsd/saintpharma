import { NextRequest } from "next/server";
import {
  validateApiToken,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/auth";
import { getLectureById } from "@/actions/lecture/getLectureById";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";

/**
 * GET /api/lectures/[id]
 * Retorna detalhes de uma aula específica
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id> (opcional, para verificar se foi concluída)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID da aula é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar aula
    const lecture = await getLectureById({ id });

    if (!lecture) {
      return new Response(JSON.stringify({ error: "Aula não encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar se há usuário logado para buscar progresso
    const userId = request.headers.get("x-user-id");
    let completed = false;

    if (userId) {
      try {
        const user = await getUserByClerkId(userId);
        if (user) {
          const userLectures = await getUserLectures({ userId: user.id });
          completed = userLectures.some(
            (progress) => progress.lectureCmsId === lecture._id
          );
        }
      } catch (error) {
        console.warn("Erro ao buscar progresso do usuário:", error);
      }
    }

    return successResponse({
      ...lecture,
      completed,
    });
  } catch (error) {
    console.error("Erro ao buscar aula:", error);
    return serverErrorResponse("Erro ao buscar detalhes da aula");
  }
}
