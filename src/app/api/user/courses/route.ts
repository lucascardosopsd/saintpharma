import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import prisma from "@/lib/prisma";

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    // Buscar cursos concluídos (com certificados)
    const completedCourses = await prisma.certificate.findMany({
      where: {
        userId: user.id
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
        createdAt: 'desc'
      }
    });

    // Buscar cursos em progresso (modelo Course não existe no Prisma)
    // Simulando dados vazios pois não temos acesso ao Sanity CMS
    const formattedInProgressCourses: any[] = [];

    // Formatar dados dos cursos concluídos
    const formattedCompletedCourses = completedCourses.map(cert => ({
      id: cert.courseCmsId,
      title: cert.courseTitle,
      description: cert.description,
      imageUrl: null,
      createdAt: cert.createdAt,
      completedAt: cert.createdAt,
      certificateId: cert.id,
      points: cert.points || 0,
      workload: cert.workload || 0
    }));

    // Filtrar por status se especificado
    let result: any = {};
    
    if (status === "completed") {
      result = {
        courses: formattedCompletedCourses,
        total: formattedCompletedCourses.length,
        status: "completed"
      };
    } else if (status === "in_progress") {
      result = {
        courses: formattedInProgressCourses,
        total: formattedInProgressCourses.length,
        status: "in_progress"
      };
    } else {
      result = {
        completed: formattedCompletedCourses,
        inProgress: formattedInProgressCourses,
        totals: {
          completed: formattedCompletedCourses.length,
          inProgress: formattedInProgressCourses.length,
          total: formattedCompletedCourses.length + formattedInProgressCourses.length
        }
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

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "courseId é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Simular validação do curso (modelo Lecture não existe no Prisma)
    const courseLectures = []; // Array vazio pois modelo não existe

    if (courseLectures.length === 0) {
      return new Response(
        JSON.stringify({ error: "Curso não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se já existe um certificado para este curso
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId: user.id,
        courseCmsId: courseId
      }
    });

    if (existingCertificate) {
      return new Response(
        JSON.stringify({ 
          error: "Usuário já possui certificado para este curso",
          certificateId: existingCertificate.id
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
        courseId: courseId
      }
    });

    if (completedLectures.length < courseLectures.length) {
      return new Response(
        JSON.stringify({ 
          error: "Nem todas as aulas do curso foram concluídas",
          completed: completedLectures.length,
          total: courseLectures.length
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
        description: 'Curso concluído com sucesso',
        points: 100,
        workload: courseLectures.length * 60
      }
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
          imageUrl: null
        },
        completedAt: certificate.createdAt,
        points: certificate.points || 0,
        workload: certificate.workload || 0
      }
    });
  } catch (error) {
    console.error("Erro ao marcar curso como concluído:", error);
    return serverErrorResponse("Erro ao marcar curso como concluído");
  }
}