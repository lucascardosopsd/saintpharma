import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";

interface RequestBody {
  period?: "week" | "month" | "all";
}

export async function GET(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Validar X-User-Id
    const userId = request.headers.get("X-User-Id");
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "X-User-Id header é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o usuário existe
    const user = await getUserByClerkId(userId);

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url);
    const period =
      (searchParams.get("period") as "week" | "month" | "all") || "all";

    // Calcular datas para filtros
    const now = new Date();
    let startDate: Date | undefined;

    if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Buscar certificados
    const certificates = await prisma.certificate.findMany({
      where: {
        userId: user.id,
        ...(startDate && { createdAt: { gte: startDate } }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Buscar aulas concluídas pelo usuário
    const userLectures = await prisma.userLecture.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        lectureCmsId: "desc",
      },
    });

    // Calcular horas estudadas baseado em timestamps reais
    const currentTime = new Date();
    const weekAgo = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(currentTime.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calcular horas estudadas (estimativa baseada no número de aulas)
    const totalHours = userLectures.length * 0.5; // Estimativa de 30 min por aula

    // Calcular horas da semana (aulas concluídas na última semana)
    const weeklyLectures = userLectures.filter(
      (ul) => ul.createdAt && new Date(ul.createdAt) >= weekAgo
    );
    const weeklyHours = weeklyLectures.length * 0.5;

    // Calcular horas do mês (aulas concluídas no último mês)
    const monthlyLectures = userLectures.filter(
      (ul) => ul.createdAt && new Date(ul.createdAt) >= monthAgo
    );
    const monthlyHours = monthlyLectures.length * 0.5;

    // Buscar exames concluídos
    const exams = await prisma.exam.findMany({
      where: {
        userId: user.id,
        ...(startDate && { createdAt: { gte: startDate } }),
      },
    });

    // Agrupar cursos por status
    const courseStats = {
      completed: certificates.length,
      inProgress: 0,
      total: 0,
    };

    // Calcular cursos em progresso (usuários que têm aulas concluídas mas não certificado)
    const coursesWithProgress = [
      ...new Set(userLectures.map((lecture) => lecture.courseId)),
    ];
    const completedCourseIds = certificates.map((cert) => cert.courseCmsId);
    courseStats.inProgress = coursesWithProgress.filter(
      (courseId) => !completedCourseIds.includes(courseId)
    ).length;
    courseStats.total = coursesWithProgress.length + certificates.length;

    // Buscar informações do Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Buscar ranking do usuário baseado em pontos
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        points: true,
      },
      orderBy: {
        points: "desc",
      },
    });

    const userPosition = allUsers.findIndex((u) => u.id === user.id) + 1;

    return successResponse({
      success: true,
      data: {
        user: {
          id: user.id,
          clerkId: user.clerkId,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Usuário",
          email: user.email,
          profileImage: user.profileImage,
          points: user.points, // Now using the actual points field from User model
        },
        studyHours: {
          total: Math.round(totalHours * 100) / 100,
          thisWeek: Math.round(weeklyHours * 100) / 100,
          thisMonth: Math.round(monthlyHours * 100) / 100,
        },
        courses: courseStats,
        certificates: {
          total: certificates.length,
          recent: certificates.slice(0, 5).map((cert) => ({
            id: cert.id,
            courseId: cert.courseCmsId,
            courseTitle: cert.courseTitle,
            courseThumbnail: null,
            workload: cert.workload,
            description: cert.description,
            points: cert.points,
            createdAt: cert.createdAt,
          })),
        },
        ranking: {
          position: userPosition,
          totalUsers: allUsers.length,
        },
        activities: {
          recentLectures: userLectures.slice(0, 10).map((lecture) => ({
            id: lecture.id,
            courseId: lecture.courseId,
            lectureId: lecture.lectureCmsId,
            lectureTitle: "Aula concluída",
            completedAt: lecture.createdAt, // Now using the actual createdAt field
          })),
          recentExams: exams.slice(0, 5).map((exam) => ({
            id: exam.id,
            lectureId: exam.lectureCMSid,
            lectureTitle: "Exame concluído",
            score: 0, // Campo score não existe no modelo
            passed: !exam.reproved, // Use reproved field to determine if passed
            completedAt: exam.createdAt,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar resumo do usuário:", error);
    return serverErrorResponse("Erro ao buscar resumo do usuário");
  }
}
