import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserByClerk } from "@/actions/user/getUserByClerk";

/**
 * GET /api/lectures
 * Retorna aulas de um curso específico com progresso do usuário
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
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

    // Buscar aulas do curso
    const lectures = await getLecturesByCourseId({ courseId });
    
    // Buscar progresso do usuário
    const userLectures = await getUserLectures({ userId: user.id });
    
    // Mapear aulas com progresso
    const lecturesWithProgress = lectures.map((lecture) => {
      const userLecture = userLectures.find(
        (ul) => ul.lectureCmsId === lecture._id
      );
      
      return {
        ...lecture,
        completed: !!userLecture
      };
    });

    return successResponse({
      lectures: lecturesWithProgress,
      totalLectures: lectures.length,
      completedLectures: userLectures.length
    });
  } catch (error) {
    console.error("Erro ao buscar aulas:", error);
    return serverErrorResponse("Erro ao buscar aulas");
  }
}