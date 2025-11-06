import { getCourseById } from "@/actions/courses/getId";
import { getCoursesByIds } from "@/actions/courses/getByIds";
import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import { getUserCertificateByCourse } from "@/actions/certification/getUserCertificatesByCourse";
import { getWeekPoints } from "@/actions/ranking/getWeekPoints";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/**
 * GET /api/courses/[id]/progress
 * Retorna o progresso detalhado de um ou múltiplos cursos para o usuário
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Query parameters (opcionais):
 * - courseIds: IDs dos cursos separados por vírgula (ex: "id1,id2,id3") ou array (ex: ["id1","id2"])
 *   Se fornecido, retorna progresso de múltiplos cursos. Se não fornecido, usa o [id] do path.
 * - includeLectures: 'true' para incluir detalhes de cada lecture (padrão: 'false')
 * - includeExams: 'true' para incluir informações de exames (padrão: 'false')
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
    const { id: courseIdFromPath } = params;
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

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url);
    const courseIdsParam = searchParams.get("courseIds");
    const includeLectures = searchParams.get("includeLectures") === "true";
    const includeExams = searchParams.get("includeExams") === "true";

    // Determinar quais IDs de curso usar
    let courseIds: string[] = [];
    if (courseIdsParam) {
      // Se courseIds foi fornecido, usar esses IDs
      courseIds = courseIdsParam.split(",").map((id) => id.trim()).filter(Boolean);
    } else if (courseIdFromPath) {
      // Se não foi fornecido courseIds mas tem ID no path, usar o ID do path
      courseIds = [courseIdFromPath];
    }

    if (courseIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "ID(s) do(s) curso(s) é(são) obrigatório(s)" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar usuário
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buscar cursos (múltiplos ou único)
    const courses = courseIds.length === 1
      ? [await getCourseById({ id: courseIds[0] })]
      : await getCoursesByIds({ ids: courseIds });

    // Filtrar cursos não encontrados
    const validCourses = courses.filter((course) => course !== null && course !== undefined);
    
    if (validCourses.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum curso encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buscar dados do usuário uma única vez
    const userLectures = await getUserLectures({ userId: user.id });
    
    // Calcular pontos da semana do usuário
    const weekPoints = await getWeekPoints(userId);

    // Processar cada curso
    const courseProgressData = await Promise.all(
      validCourses.map(async (course) => {
        const courseId = course._id;

        // Buscar lectures, certificado e exames em paralelo
        const [lectures, certificate] = await Promise.all([
          getLecturesByCourseId({ courseId }),
          getUserCertificateByCourse({ courseId, userId: user.id }),
        ]);

        // Filtrar lectures completadas pelo usuário neste curso
        const completedLectures = userLectures.filter(
          (ul) => ul.courseId === courseId
        );
        const completedLectureIds = new Set(
          completedLectures.map((ul) => ul.lectureCmsId)
        );

        // Calcular progresso
        const totalLectures = lectures.length;
        const completedCount = lectures.filter((lecture) =>
          completedLectureIds.has(lecture._id)
        ).length;
        const progressPercentage =
          totalLectures > 0
            ? Math.round((completedCount / totalLectures) * 100)
            : 0;

        // Determinar status do curso
        let status = "not_started";
        if (certificate) {
          status = "completed";
        } else if (completedCount > 0) {
          status = "in_progress";
        }

        // Verificar se está pronto para certificado
        const isReadyForCertificate =
          !certificate && completedCount === totalLectures && totalLectures > 0;

        // Verificar acesso ao curso premium baseado em pontos da semana
        let canAccess = true;
        if (course.premiumPoints && course.premiumPoints > 0) {
          canAccess = weekPoints > course.premiumPoints;
        }

        // Buscar exames relacionados ao curso se solicitado
        let examsData: any[] = [];
        if (includeExams) {
          const lectureIds = lectures.map((l) => l._id);
          const exams = await prisma.exam.findMany({
            where: {
              userId: user.id,
              lectureCMSid: { in: lectureIds },
            },
            select: {
              id: true,
              lectureCMSid: true,
              complete: true,
              reproved: true,
              timeLimit: true,
              passingScore: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          examsData = exams.map((exam) => ({
            id: exam.id,
            lectureId: exam.lectureCMSid,
            complete: exam.complete || false,
            reproved: exam.reproved || false,
            timeLimit: exam.timeLimit,
            passingScore: exam.passingScore,
            createdAt: exam.createdAt,
            updatedAt: exam.updatedAt,
          }));
        }

        // Preparar dados do curso
        const progressData: any = {
          course: {
            id: course._id,
            name: course.name,
            slug: course.slug,
            description: course.description,
            points: course.points || 0,
            workload: course.workload || 0,
            premiumPoints: course.premiumPoints || null,
            imageUrl: course.banner?.asset?.url || null,
            canAccess,
            weekPointsRequired: course.premiumPoints || null,
            userWeekPoints: weekPoints,
          },
          progress: {
            status,
            percentage: progressPercentage,
            completedLectures: completedCount,
            totalLectures,
            remainingLectures: totalLectures - completedCount,
            isCompleted: !!certificate,
            isReadyForCertificate,
          },
          certificate: certificate
            ? {
                id: certificate.id,
                courseTitle: certificate.courseTitle,
                points: certificate.points,
                workload: certificate.workload,
                createdAt: certificate.createdAt,
              }
            : null,
        };

        // Adicionar detalhes das lectures se solicitado
        if (includeLectures) {
          progressData.lectures = lectures.map((lecture) => {
            const userLecture = completedLectures.find(
              (ul) => ul.lectureCmsId === lecture._id
            );
            return {
              id: lecture._id,
              title: lecture.title,
              completed: completedLectureIds.has(lecture._id),
              completedAt: userLecture?.createdAt || null,
            };
          });
        }

        // Adicionar exames se solicitado
        if (includeExams) {
          progressData.exams = examsData;
          progressData.examStats = {
            total: examsData.length,
            completed: examsData.filter((e) => e.complete).length,
            reproved: examsData.filter((e) => e.reproved).length,
            pending: examsData.filter((e) => !e.complete).length,
          };
        }

        // Adicionar última atividade
        if (completedLectures.length > 0) {
          const lastActivity = completedLectures.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          )[0];
          progressData.lastActivity = lastActivity.createdAt;
        }

        return progressData;
      })
    );

    // Se foi apenas um curso E não foi via courseIds (veio do path), retornar no formato original (compatibilidade)
    if (courseIds.length === 1 && !courseIdsParam) {
      return successResponse(courseProgressData[0]);
    }

    // Se foram múltiplos cursos OU courseIds foi fornecido (mesmo que seja 1), retornar array
    return successResponse({
      courses: courseProgressData,
      total: courseProgressData.length,
    });
  } catch (error) {
    console.error("Erro ao buscar progresso do curso:", error);
    return serverErrorResponse("Erro ao buscar progresso do curso");
  }
}

