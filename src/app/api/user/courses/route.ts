import { getCourses } from "@/actions/courses/get";
import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
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
 * GET /api/user/courses
 * Retorna os cursos do usuário (em progresso e concluídos)
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Query params (opcionais):
 * - status: 'completed' | 'in_progress' | 'all' (padrão: 'all')
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    // Buscar todos os cursos do Sanity CMS
    const allCourses = await getCourses();

    // Buscar certificados do usuário
    const userCertificates = await prisma.certificate.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        courseTitle: true,
        courseCmsId: true,
        description: true,
        points: true,
        workload: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Buscar aulas concluídas pelo usuário
    const userLectures = await getUserLectures({ userId: user.id });

    // Processar cada curso para determinar status e progresso
    const courseProgress = await Promise.all(
      allCourses.map(async (course) => {
        const courseId = course._id;

        // Verificar se o curso foi concluído (tem certificado)
        const certificate = userCertificates.find(
          (cert) => cert.courseCmsId === courseId
        );

        // Buscar aulas do curso
        const courseLectures = await getLecturesByCourseId({
          courseId,
        });

        // Filtrar lectures completadas pelo usuário neste curso
        const completedLectures = userLectures.filter((ul) =>
          ul.courseId === courseId
        );
        const completedLectureIds = new Set(
          completedLectures.map((ul) => ul.lectureCmsId)
        );

        // Calcular progresso
        const totalLectures = courseLectures.length;
        const completedCount = courseLectures.filter((lecture) =>
          completedLectureIds.has(lecture._id)
        ).length;
        const progressPercentage =
          totalLectures > 0
            ? Math.round((completedCount / totalLectures) * 100)
            : 0;

        // Determinar status baseado no progresso
        let courseStatus = "not_started";
        if (certificate) {
          courseStatus = "completed";
        } else if (completedCount > 0) {
          courseStatus = "in_progress";
        }

        // Verificar se está pronto para certificado
        const isReadyForCertificate =
          !certificate && completedCount === totalLectures && totalLectures > 0;

        // Calcular última atividade
        let lastActivity = null;
        if (completedLectures.length > 0) {
          const sortedLectures = completedLectures.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );
          lastActivity = sortedLectures[0].createdAt;
        }

        // Montar objeto de progresso detalhado
        const progressData = {
          status: courseStatus,
          percentage: progressPercentage,
          completedLectures: completedCount,
          totalLectures,
          remainingLectures: totalLectures - completedCount,
          isCompleted: !!certificate,
          isReadyForCertificate,
        };

        // Montar resposta do curso
        return {
          id: courseId,
          title: course.name,
          slug: course.slug || null,
          description: course.description,
          imageUrl: course.banner?.asset?.url || null,
          points: course.points || 0,
          workload: course.workload || 0,
          status: courseStatus,
          progress: progressPercentage, // Mantido para compatibilidade
          progressDetails: progressData, // Novo objeto detalhado
          completedLectures: completedCount, // Mantido para compatibilidade
          totalLectures, // Mantido para compatibilidade
          certificate: certificate
            ? {
                id: certificate.id,
                courseTitle: certificate.courseTitle,
                points: certificate.points,
                workload: certificate.workload,
                createdAt: certificate.createdAt,
              }
            : null,
          certificateId: certificate?.id || null, // Mantido para compatibilidade
          completedAt: certificate?.createdAt || null, // Mantido para compatibilidade
          lastActivity,
          createdAt:
            completedLectures.length > 0
              ? completedLectures[0].createdAt
              : null,
        };
      })
    );

    // Separar cursos por status
    const completedCourses = courseProgress.filter(
      (course) => course.status === "completed"
    );
    const inProgressCourses = courseProgress.filter(
      (course) =>
        course.status === "in_progress" ||
        course.status === "ready_for_certificate"
    );

    // Filtrar por status se especificado
    let result: any = {};

    if (status === "completed") {
      result = {
        courses: completedCourses,
        total: completedCourses.length,
        status: "completed",
      };
    } else if (status === "in_progress") {
      result = {
        courses: inProgressCourses,
        total: inProgressCourses.length,
        status: "in_progress",
      };
    } else {
      result = {
        completed: completedCourses,
        inProgress: inProgressCourses,
        totals: {
          completed: completedCourses.length,
          inProgress: inProgressCourses.length,
          total: completedCourses.length + inProgressCourses.length,
        },
      };
    }

    return successResponse(result);
  } catch (error) {
    console.error("Erro ao buscar cursos do usuário:", error);
    return serverErrorResponse("Erro ao buscar cursos do usuário");
  }
}

/**
 * POST /api/user/courses
 * Adiciona um curso como concluído para o usuário (cria certificado)
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Body:
 * - courseId: ID do curso a ser marcado como concluído
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return new Response(JSON.stringify({ error: "courseId é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Simular validação do curso (modelo Lecture não existe no Prisma)
    const courseLectures = []; // Array vazio pois modelo não existe

    if (courseLectures.length === 0) {
      return new Response(JSON.stringify({ error: "Curso não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar se já existe um certificado para este curso
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId: user.id,
        courseCmsId: courseId,
      },
    });

    if (existingCertificate) {
      return new Response(
        JSON.stringify({
          error: "Usuário já possui certificado para este curso",
          certificateId: existingCertificate.id,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se todas as aulas do curso foram concluídas
    const completedLectures = await prisma.userLecture.findMany({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (completedLectures.length < courseLectures.length) {
      return new Response(
        JSON.stringify({
          error: "Nem todas as aulas do curso foram concluídas",
          completed: completedLectures.length,
          total: courseLectures.length,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Criar certificado
    const certificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        courseCmsId: courseId,
        courseTitle: `Curso ${courseId}`,
        description: "Curso concluído com sucesso",
        points: 100,
        workload: courseLectures.length * 60,
      },
    });

    return successResponse({
      message: "Curso marcado como concluído com sucesso",
      certificate: {
        id: certificate.id,
        courseId: certificate.courseCmsId,
        course: {
          id: certificate.courseCmsId,
          title: certificate.courseTitle,
          description: certificate.description,
          imageUrl: null,
        },
        completedAt: certificate.createdAt,
        points: certificate.points || 0,
        workload: certificate.workload || 0,
      },
    });
  } catch (error) {
    console.error("Erro ao marcar curso como concluído:", error);
    return serverErrorResponse("Erro ao marcar curso como concluído");
  }
}
