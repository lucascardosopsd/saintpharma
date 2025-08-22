import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getCourses } from "@/actions/courses/get";

/**
 * GET /api/courses
 * Retorna lista de todos os cursos disponíveis
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
    const courses = await getCourses();
    
    return successResponse({
      courses,
      total: courses.length
    });
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return serverErrorResponse("Erro ao buscar cursos");
  }
}