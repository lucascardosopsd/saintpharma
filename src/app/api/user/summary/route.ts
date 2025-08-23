import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

interface RequestBody {
  period?: 'week' | 'month' | 'all';
}

export async function GET(request: NextRequest) {
  try {
    // Validar token de API
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.API_TOKEN) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Validar X-User-Id
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json(
        { error: 'X-User-Id header é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'week' | 'month' | 'all') || 'all';

    // Calcular datas para filtros
    const now = new Date();
    let startDate: Date | undefined;
    
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Buscar certificados
    const certificates = await prisma.certificate.findMany({
      where: {
        userId: user.id,
        ...(startDate && { createdAt: { gte: startDate } }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Buscar aulas concluídas pelo usuário
    const userLectures = await prisma.userLecture.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        lectureCmsId: 'desc',
      },
    });

    // Calcular horas estudadas (estimativa baseada no número de aulas)
    const totalHours = userLectures.length * 0.5; // Estimativa de 30 min por aula
    const weeklyHours = 0; // Não é possível calcular sem timestamps
    const monthlyHours = 0; // Não é possível calcular sem timestamps

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
    const coursesWithProgress = [...new Set(userLectures.map(lecture => lecture.courseId))];
    const completedCourseIds = certificates.map(cert => cert.courseCmsId);
    courseStats.inProgress = coursesWithProgress.filter(courseId => !completedCourseIds.includes(courseId)).length;
    courseStats.total = coursesWithProgress.length + certificates.length;

    // Buscar informações do Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Buscar ranking do usuário (sem campo points)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const userPosition = allUsers.findIndex(u => u.id === user.id) + 1;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          clerkId: user.clerkId,
          name: user.name || clerkUser.firstName + ' ' + clerkUser.lastName,
          email: user.email,
          profileImage: user.profileImage,
          points: 0, // Campo points não existe no modelo User
        },
        studyHours: {
          total: Math.round(totalHours * 100) / 100,
          thisWeek: Math.round(weeklyHours * 100) / 100,
          thisMonth: Math.round(monthlyHours * 100) / 100,
        },
        courses: courseStats,
        certificates: {
          total: certificates.length,
          recent: certificates.slice(0, 5).map(cert => ({
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
          recentLectures: userLectures.slice(0, 10).map(lecture => ({
            id: lecture.id,
            courseId: lecture.courseId,
            lectureId: lecture.lectureCmsId,
            lectureTitle: 'Aula concluída',
            completedAt: new Date(), // Campo createdAt não existe no modelo
          })),
          recentExams: exams.slice(0, 5).map(exam => ({
            id: exam.id,
            lectureId: exam.lectureCMSid,
            lectureTitle: 'Exame concluído',
            score: 0, // Campo score não existe no modelo
            passed: false,
            completedAt: exam.createdAt,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar resumo do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}