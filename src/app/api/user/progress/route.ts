import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

/**
 * GET /api/user/progress
 * Retorna progresso detalhado do usuário por curso
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Query parameters (opcionais):
 * - courseId: ID específico do curso para filtrar
 * - status: 'in_progress', 'completed', 'not_started', 'all' (padrão: 'all')
 * - includeDetails: 'true' para incluir detalhes das aulas (padrão: 'false')
 * - page: número da página para paginação (padrão: 1)
 * - limit: limite de resultados por página (padrão: 10)
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

    // Verificar se usuário existe
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status") || "all";
    const includeDetails = searchParams.get("includeDetails") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const skip = (page - 1) * limit;

    // Buscar dados do usuário com queries otimizadas
    const [userLectures, userCertificates, userExams] = await Promise.all([
      // Buscar aulas concluídas pelo usuário
      prisma.userLecture.findMany({
        where: {
          userId: user.id,
          ...(courseId && { courseId }),
        },
        select: {
          id: true,
          courseId: true,
          lectureCmsId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      // Buscar certificados do usuário
      prisma.certificate.findMany({
        where: {
          userId: user.id,
          ...(courseId && { courseCmsId: courseId }),
        },
        select: {
          id: true,
          courseCmsId: true,
          courseTitle: true,
          points: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      // Buscar exames do usuário
      prisma.exam.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          lectureCMSid: true,
          complete: true,
          reproved: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Agrupar dados por curso
    const courseData = new Map();

    // Processar aulas concluídas
    userLectures.forEach((lecture: any) => {
      const courseId = lecture.courseId;
      if (!courseData.has(courseId)) {
        courseData.set(courseId, {
          courseId,
          completedLectures: [],
          certificates: [],
          exams: [],
        });
      }
      courseData.get(courseId).completedLectures.push(lecture);
    });

    // Processar certificados
    userCertificates.forEach((cert: any) => {
      const courseId = cert.courseCmsId;
      if (!courseData.has(courseId)) {
        courseData.set(courseId, {
          courseId,
          completedLectures: [],
          certificates: [],
          exams: [],
        });
      }
      courseData.get(courseId).certificates.push(cert);
    });

    // Processar exames (se includeDetails for true)
    if (includeDetails) {
      userExams.forEach((exam: any) => {
        // Encontrar o curso através do lectureCMSid
        const relatedLecture = userLectures.find(
          (ul: any) => ul.lectureCmsId === exam.lectureCMSid
        );
        if (relatedLecture) {
          const courseId = relatedLecture.courseId;
          if (courseData.has(courseId)) {
            courseData.get(courseId).exams.push(exam);
          }
        }
      });
    }

    const totalCourses = courseData.size;

    // Processar dados dos cursos
    const processedCourses = Array.from(courseData.values()).map(
      (data: any) => {
        const completedLectures = data.completedLectures.length;
        const isCompleted = data.certificates.length > 0;

        // Determinar status do curso
        let courseStatus = "not_started";
        if (isCompleted) {
          courseStatus = "completed";
        } else if (completedLectures > 0) {
          courseStatus = "in_progress";
        }

        // Dados básicos do curso
        const courseInfo: any = {
          courseId: data.courseId,
          status: courseStatus,
          progress: {
            completed: completedLectures,
            // Nota: não temos o total de aulas do curso no banco local
            // seria necessário buscar do Sanity CMS
            total: null,
            percentage: null,
          },
          isCompleted,
          certificateId: data.certificates[0]?.id || null,
          completedAt: data.certificates[0]?.createdAt || null,
        };

        // Adicionar detalhes das aulas se solicitado
        if (includeDetails) {
          courseInfo.completedLectures = data.completedLectures.map(
            (lecture: any) => ({
              lectureCmsId: lecture.lectureCmsId,
              courseId: lecture.courseId,
              completedAt: lecture.createdAt || null,
            })
          );

          courseInfo.exams = data.exams.map((exam: any) => ({
            id: exam.id,
            lectureCMSid: exam.lectureCMSid,
            complete: exam.complete,
            reproved: exam.reproved,
            completedAt: exam.createdAt,
          }));
        }

        // Última atividade no curso
        if (data.completedLectures.length > 0) {
          const lastActivity = data.completedLectures.sort(
            (a: any, b: any) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          )[0];
          courseInfo.lastActivity = lastActivity.createdAt;
        }

        return courseInfo;
      }
    );

    // Filtrar por status se especificado
    let filteredCourses = processedCourses;
    if (status !== "all") {
      filteredCourses = processedCourses.filter(
        (course: any) => course.status === status
      );
    }

    // Aplicar paginação
    const paginatedCourses = filteredCourses.slice(skip, skip + limit);
    const totalFiltered = filteredCourses.length;
    const totalPages = Math.ceil(totalFiltered / limit);

    // Calcular estatísticas gerais
    const stats = {
      totalCourses: processedCourses.length,
      completedCourses: processedCourses.filter(
        (c: any) => c.status === "completed"
      ).length,
      inProgressCourses: processedCourses.filter(
        (c: any) => c.status === "in_progress"
      ).length,
      notStartedCourses: 0, // Não temos como saber cursos não iniciados sem dados do Sanity
      totalLectures: null, // Não disponível sem dados do Sanity
      completedLectures: processedCourses.reduce(
        (sum: number, c: any) => sum + c.progress.completed,
        0
      ),
    };

    const overallProgress = null; // Não pode ser calculado sem o total de aulas

    const progressResponse = {
      user: {
        id: user.id,
        clerkId: user.clerkId,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || "Usuário",
        email: user.email,
      },
      progress: {
        overall: {
          percentage: overallProgress,
          completedLectures: stats.completedLectures,
          totalLectures: stats.totalLectures,
        },
        courses: paginatedCourses,
        stats,
      },
      pagination: {
        page,
        limit,
        total: filteredCourses.length,
        pages: Math.ceil(filteredCourses.length / limit),
        hasNext: page * limit < filteredCourses.length,
        hasPrev: page > 1,
      },
      filters: {
        courseId,
        status,
        includeDetails,
      },
    };

    return successResponse(progressResponse);
  } catch (error) {
    console.error("Erro ao buscar progresso do usuário:", error);
    return serverErrorResponse("Erro interno ao buscar progresso do usuário");
  }
}
