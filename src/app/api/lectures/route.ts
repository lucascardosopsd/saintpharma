import { NextRequest } from "next/server";
import {
  validateApiToken,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from "@/lib/auth";
import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";

/**
 * GET /api/lectures
 * Retorna aulas de um curso específico com progresso do usuário
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id> (opcional, para incluir progresso)
 *
 * Query params obrigatórios:
 * - courseId: ID do curso
 */
export async function GET(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Obter courseId dos query params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "Query param courseId é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar aulas do curso
    const lectures = await getLecturesByCourseId({ courseId });

    // Verificar se há usuário logado para buscar progresso
    const userId = request.headers.get("x-user-id");
    let userLectures: any[] = [];

    if (userId) {
      try {
        const user = await getUserByClerkId(userId);
        if (user) {
          userLectures = await getUserLectures({ userId: user.id });
        }
      } catch (error) {
        console.warn("Erro ao buscar progresso do usuário:", error);
      }
    }

    // Mapear aulas com progresso
    const lecturesWithProgress = lectures.map((lecture) => {
      const userLecture = userLectures.find(
        (ul) => ul.lectureCmsId === lecture._id
      );

      return {
        ...lecture,
        completed: !!userLecture,
      };
    });

    return successResponse({
      lectures: lecturesWithProgress,
      totalLectures: lectures.length,
      completedLectures: userLectures.filter((ul) =>
        lectures.some((lecture) => lecture._id === ul.lectureCmsId)
      ).length,
    });
  } catch (error) {
    console.error("Erro ao buscar aulas:", error);
    return serverErrorResponse("Erro ao buscar aulas");
  }
}
