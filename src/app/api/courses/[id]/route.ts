import { getCourseById } from "@/actions/courses/getId";
import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import { getWeekPoints } from "@/actions/ranking/getWeekPoints";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { UserLecture } from "@prisma/client";
import { NextRequest } from "next/server";

/**
 * GET /api/courses/[id]
 * Retorna detalhes de um curso específico com suas lectures
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id> (opcional, para verificar progresso)
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
        JSON.stringify({ error: "ID do curso é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar curso
    const course = await getCourseById({ id });

    if (!course) {
      return new Response(JSON.stringify({ error: "Curso não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buscar lectures do curso
    const lectures = await getLecturesByCourseId({ courseId: id });

    // Verificar se há usuário logado para buscar progresso
    const userId = request.headers.get("x-user-id");
    let userProgress: UserLecture[] = [];
    let weekPoints = 0;
    let canAccess = true;

    if (userId) {
      try {
        const user = await getUserByClerkId(userId);
        if (user) {
          userProgress = await getUserLectures({ userId: user.id });
          weekPoints = await getWeekPoints(userId);
          
          // Verificar acesso ao curso premium baseado em pontos da semana
          if (course.premiumPoints && course.premiumPoints > 0) {
            canAccess = weekPoints > course.premiumPoints;
          }
        }
      } catch (error) {
        console.warn("Erro ao buscar progresso do usuário:", error);
      }
    }

    // Mapear lectures com status de conclusão
    const lecturesWithProgress = lectures.map((lecture) => ({
      ...lecture,
      completed: userProgress.some(
        (progress) => progress.lectureCmsId === lecture._id
      ),
    }));

    return successResponse({
      course: {
        ...course,
        canAccess,
        weekPointsRequired: course.premiumPoints || null,
        userWeekPoints: userId ? weekPoints : null,
      },
      lectures: lecturesWithProgress,
      totalLectures: lectures.length,
      completedLectures: lecturesWithProgress.filter((l) => l.completed).length,
    });
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    return serverErrorResponse("Erro ao buscar detalhes do curso");
  }
}
