import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getCourses } from "@/actions/courses/get";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import { getWeekPoints } from "@/actions/ranking/getWeekPoints";

/**
 * GET /api/courses
 * Retorna lista de todos os cursos disponíveis
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id> (opcional, para verificar acesso a cursos premium)
 */
export async function GET(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const userId = request.headers.get("x-user-id");
    let weekPoints = 0;
    let userExists = false;

    // Se userId foi fornecido, calcular pontos da semana
    if (userId) {
      const user = await getUserByClerkId(userId);
      if (user) {
        userExists = true;
        weekPoints = await getWeekPoints(userId);
      }
    }

    const courses = await getCourses();
    
    // Adicionar informação de acesso para cada curso
    const coursesWithAccess = courses.map((course) => {
      let canAccess = true;
      
      // Se o curso é premium e o usuário foi fornecido, verificar acesso
      if (course.premiumPoints && course.premiumPoints > 0 && userExists) {
        canAccess = weekPoints > course.premiumPoints;
      }
      
      return {
        ...course,
        canAccess,
        weekPointsRequired: course.premiumPoints || null,
        userWeekPoints: userExists ? weekPoints : null,
      };
    });
    
    return successResponse({
      courses: coursesWithAccess,
      total: courses.length
    });
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return serverErrorResponse("Erro ao buscar cursos");
  }
}