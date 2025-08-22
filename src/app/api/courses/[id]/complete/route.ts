import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getCourseById } from "@/actions/courses/getId";
import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { createCertificate } from "@/actions/certification/create";
import { getUserCertificateByCourse } from "@/actions/certification/getUserCertificatesByCourse";

/**
 * POST /api/courses/[id]/complete
 * Marca um curso como concluído e gera certificado se aplicável
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id: courseId } = params;
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

    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "ID do curso é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar usuário
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

    // Buscar curso
    const course = await getCourseById({ id: courseId });
    if (!course) {
      return new Response(
        JSON.stringify({ error: "Curso não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se já existe certificado para este curso
    const existingCertificate = await getUserCertificateByCourse({
      courseId,
      userId: user.id
    });

    if (existingCertificate) {
      return new Response(
        JSON.stringify({ 
          error: "Certificado já foi gerado para este curso",
          certificate: existingCertificate
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se todas as lectures foram concluídas
    const [lectures, userLectures] = await Promise.all([
      getLecturesByCourseId({ courseId }),
      getUserLectures({ userId: user.id })
    ]);

    const completedLectureIds = userLectures
      .filter(ul => ul.courseId === courseId)
      .map(ul => ul.lectureCmsId);

    const allLecturesCompleted = lectures.every(lecture => 
      completedLectureIds.includes(lecture._id)
    );

    if (!allLecturesCompleted) {
      return new Response(
        JSON.stringify({ 
          error: "Todas as aulas devem ser concluídas antes de gerar o certificado",
          progress: {
            total: lectures.length,
            completed: completedLectureIds.length,
            remaining: lectures.length - completedLectureIds.length
          }
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Criar certificado
    const certificate = await createCertificate({
      userId: user.id,
      course
    });

    return successResponse({
      message: "Curso concluído com sucesso",
      certificate,
      course: {
        id: course._id,
        name: course.name,
        points: course.points
      }
    }, 201);
  } catch (error) {
    console.error("Erro ao concluir curso:", error);
    return serverErrorResponse("Erro ao concluir curso");
  }
}