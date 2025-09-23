import { getUserByClerkId } from "@/actions/user/getUserByClerk";
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
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Obter clerkId dos parâmetros da query ou do header
    const { searchParams } = new URL(request.url);
    const clerkId =
      searchParams.get("clerkId") || request.headers.get("X-User-Id");

    if (!clerkId) {
      return new Response(
        JSON.stringify({
          error:
            "clerkId é obrigatório (via query parameter ou header X-User-Id)",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar o usuário
    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obter parâmetros de query
    const activityType = searchParams.get("type") || "all"; // certificate, lecture, exam, damage, all
    const period = searchParams.get("period") || "all"; // week, month, year, all
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    // Calcular datas para filtros
    const now = new Date();
    let startDate: Date | undefined;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Buscar atividades baseadas no tipo
    const activities: any[] = [];

    if (activityType === "all" || activityType === "certificate") {
      const certificates = await prisma.certificate.findMany({
        where: {
          userId: user.id,
          ...(startDate && { createdAt: { gte: startDate } }),
        },
        select: {
          id: true,
          courseTitle: true,
          points: true,
          workload: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      activities.push(
        ...certificates.map((cert) => ({
          id: cert.id,
          type: "certificate",
          title: `Certificado obtido: ${cert.courseTitle}`,
          description: `${cert.workload}h de curso concluído`,
          points: cert.points,
          createdAt: cert.createdAt,
          metadata: {
            courseTitle: cert.courseTitle,
            workload: cert.workload,
          },
        }))
      );
    }

    if (activityType === "all" || activityType === "lecture") {
      const userLectures = await prisma.userLecture.findMany({
        where: {
          userId: user.id,
          ...(startDate && { createdAt: { gte: startDate } }),
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
      });

      activities.push(
        ...userLectures.map((lecture) => ({
          id: lecture.id,
          type: "lecture",
          title: "Aula concluída",
          description: `Aula ${lecture.lectureCmsId} do curso ${lecture.courseId}`,
          points: 0,
          createdAt: lecture.createdAt,
          metadata: {
            courseId: lecture.courseId,
            lectureCmsId: lecture.lectureCmsId,
          },
        }))
      );
    }

    if (activityType === "all" || activityType === "exam") {
      const examAttempts = await prisma.examAttempt.findMany({
        where: {
          userId: user.id,
          ...(startDate && { createdAt: { gte: startDate } }),
        },
        select: {
          id: true,
          score: true,
          passed: true,
          totalQuestions: true,
          correctAnswers: true,
          timeSpent: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      activities.push(
        ...examAttempts.map((attempt) => ({
          id: attempt.id,
          type: "exam",
          title: `Exame ${attempt.passed ? "aprovado" : "reprovado"}`,
          description: `${attempt.correctAnswers}/${attempt.totalQuestions} questões corretas (${attempt.score}%)`,
          points: 0,
          createdAt: attempt.createdAt,
          metadata: {
            score: attempt.score,
            passed: attempt.passed,
            totalQuestions: attempt.totalQuestions,
            correctAnswers: attempt.correctAnswers,
            timeSpent: attempt.timeSpent,
          },
        }))
      );
    }

    if (activityType === "all" || activityType === "damage") {
      const damages = await prisma.damage.findMany({
        where: {
          userId: user.id,
          ...(startDate && { createdAt: { gte: startDate } }),
        },
        select: {
          id: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      activities.push(
        ...damages.map((damage) => ({
          id: damage.id,
          type: "damage",
          title: "Vida perdida",
          description: "Uma vida foi perdida",
          points: 0,
          createdAt: damage.createdAt,
          metadata: {},
        }))
      );
    }

    // Ordenar todas as atividades por data
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Aplicar paginação
    const totalActivities = activities.length;
    const paginatedActivities = activities.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalActivities / limit);

    // Calcular estatísticas das atividades
    const stats = {
      total: totalActivities,
      byType: {
        certificate: activities.filter((a) => a.type === "certificate").length,
        lecture: activities.filter((a) => a.type === "lecture").length,
        exam: activities.filter((a) => a.type === "exam").length,
        damage: activities.filter((a) => a.type === "damage").length,
      },
      period,
      type: activityType,
    };

    return successResponse({
      message: "Atividades do usuário encontradas com sucesso",
      activities: paginatedActivities,
      stats,
      pagination: {
        page,
        limit,
        total: totalActivities,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar atividades do usuário:", error);
    return serverErrorResponse("Erro ao buscar atividades do usuário");
  }
}

/**
 * GET /api/user/activities
 * Busca o histórico de atividades de um usuário
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id> (opcional, se não fornecido via query)
 *
 * Query parameters:
 * - clerkId: string (opcional, se não fornecido via header)
 * - type: string (opcional) - "certificate", "lecture", "exam", "damage", "all" (padrão: "all")
 * - period: string (opcional) - "week", "month", "year", "all" (padrão: "all")
 * - page: number (opcional) - Página para paginação (padrão: 1)
 * - limit: number (opcional) - Limite de resultados por página (padrão: 20, máximo: 100)
 *
 * Exemplo de uso:
 * GET /api/user/activities?clerkId=user_2abc123def456&type=exam&period=month&page=1&limit=10
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "message": "Atividades do usuário encontradas com sucesso",
 *   "activities": [
 *     {
 *       "id": "activity_id",
 *       "type": "exam",
 *       "title": "Exame aprovado",
 *       "description": "8/10 questões corretas (80%)",
 *       "points": 0,
 *       "createdAt": "2024-01-01T00:00:00.000Z",
 *       "metadata": {
 *         "score": 80,
 *         "passed": true,
 *         "totalQuestions": 10,
 *         "correctAnswers": 8,
 *         "timeSpent": 1200
 *       }
 *     }
 *   ],
 *   "stats": {
 *     "total": 25,
 *     "byType": {
 *       "certificate": 3,
 *       "lecture": 15,
 *       "exam": 5,
 *       "damage": 2
 *     },
 *     "period": "month",
 *     "type": "exam"
 *   },
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 25,
 *     "pages": 3,
 *     "hasNext": true,
 *     "hasPrev": false
 *   }
 * }
 */
