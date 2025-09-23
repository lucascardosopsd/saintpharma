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

    // Obter parâmetros de query para filtros
    const period = searchParams.get("period") || "all"; // week, month, year, all
    const includeDetails = searchParams.get("includeDetails") === "true";

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

    // Buscar estatísticas do usuário
    const [certificates, userLectures, exams, examAttempts, damages, allUsers] =
      await Promise.all([
        // Certificados
        prisma.certificate.findMany({
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
        }),

        // Aulas concluídas
        prisma.userLecture.findMany({
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
        }),

        // Exames
        prisma.exam.findMany({
          where: {
            userId: user.id,
            ...(startDate && { createdAt: { gte: startDate } }),
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

        // Tentativas de exames
        prisma.examAttempt.findMany({
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
        }),

        // Danos (vidas perdidas)
        prisma.damage.findMany({
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
        }),

        // Todos os usuários para ranking
        prisma.user.findMany({
          select: {
            id: true,
            points: true,
          },
          orderBy: {
            points: "desc",
          },
        }),
      ]);

    // Calcular estatísticas
    const totalPoints = certificates.reduce(
      (sum, cert) => sum + cert.points,
      0
    );
    const totalWorkload = certificates.reduce(
      (sum, cert) => sum + cert.workload,
      0
    );
    const completedExams = exams.filter((exam) => exam.complete).length;
    const passedExams = examAttempts.filter((attempt) => attempt.passed).length;
    const failedExams = examAttempts.filter(
      (attempt) => !attempt.passed
    ).length;
    const averageScore =
      examAttempts.length > 0
        ? examAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          examAttempts.length
        : 0;

    // Calcular ranking
    const userPosition = allUsers.findIndex((u) => u.id === user.id) + 1;
    const totalUsers = allUsers.length;

    // Calcular horas estudadas (estimativa)
    const estimatedHoursPerLecture = 0.5; // 30 minutos por aula
    const totalStudyHours = userLectures.length * estimatedHoursPerLecture;

    // Estatísticas por período
    const stats: any = {
      period,
      user: {
        id: user.id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        points: user.points,
      },
      achievements: {
        certificates: {
          total: certificates.length,
          points: totalPoints,
          workload: totalWorkload,
        },
        lectures: {
          completed: userLectures.length,
          estimatedHours: Math.round(totalStudyHours * 100) / 100,
        },
        exams: {
          total: exams.length,
          completed: completedExams,
          passed: passedExams,
          failed: failedExams,
          averageScore: Math.round(averageScore * 100) / 100,
        },
        damages: {
          total: damages.length,
        },
      },
      ranking: {
        position: userPosition,
        totalUsers,
        percentile:
          totalUsers > 0
            ? Math.round(((totalUsers - userPosition + 1) / totalUsers) * 100)
            : 0,
      },
      activity: {
        totalActivities:
          certificates.length + userLectures.length + exams.length,
        lastActivity: Math.max(
          ...certificates.map((c) => new Date(c.createdAt).getTime()),
          ...userLectures.map((l) => new Date(l.createdAt).getTime()),
          ...exams.map((e) => new Date(e.createdAt).getTime()),
          0
        ),
      },
    };

    // Adicionar detalhes se solicitado
    if (includeDetails) {
      stats.details = {
        recentCertificates: certificates.slice(0, 5),
        recentLectures: userLectures.slice(0, 10),
        recentExams: exams.slice(0, 5),
        recentExamAttempts: examAttempts.slice(0, 10),
        recentDamages: damages.slice(0, 5),
      };
    }

    return successResponse({
      message: "Estatísticas do usuário encontradas com sucesso",
      stats,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do usuário:", error);
    return serverErrorResponse("Erro ao buscar estatísticas do usuário");
  }
}

/**
 * GET /api/user/stats
 * Busca estatísticas detalhadas de um usuário
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id> (opcional, se não fornecido via query)
 *
 * Query parameters:
 * - clerkId: string (opcional, se não fornecido via header)
 * - period: string (opcional) - "week", "month", "year", "all" (padrão: "all")
 * - includeDetails: boolean (opcional) - "true" para incluir detalhes (padrão: "false")
 *
 * Exemplo de uso:
 * GET /api/user/stats?clerkId=user_2abc123def456&period=month&includeDetails=true
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "message": "Estatísticas do usuário encontradas com sucesso",
 *   "stats": {
 *     "period": "month",
 *     "user": {
 *       "id": "user_id",
 *       "clerkId": "user_2abc123def456",
 *       "name": "João Silva",
 *       "email": "usuario@exemplo.com",
 *       "points": 150
 *     },
 *     "achievements": {
 *       "certificates": {
 *         "total": 3,
 *         "points": 150,
 *         "workload": 12
 *       },
 *       "lectures": {
 *         "completed": 25,
 *         "estimatedHours": 12.5
 *       },
 *       "exams": {
 *         "total": 10,
 *         "completed": 8,
 *         "passed": 6,
 *         "failed": 2,
 *         "averageScore": 75.5
 *       },
 *       "damages": {
 *         "total": 2
 *       }
 *     },
 *     "ranking": {
 *       "position": 15,
 *       "totalUsers": 100,
 *       "percentile": 85
 *     },
 *     "activity": {
 *       "totalActivities": 38,
 *       "lastActivity": 1704067200000
 *     }
 *   }
 * }
 */
