import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import prisma from "@/lib/prisma";

/**
 * POST /api/auth/logout
 * Realiza logout do usuário e atualiza informações de sessão
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * 
 * Body (opcional):
 * - sessionDuration: duração da sessão em minutos (para estatísticas)
 * - reason: motivo do logout ('manual', 'timeout', 'forced', etc.)
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

    // Obter dados opcionais do body
    let sessionDuration = null;
    let reason = 'manual';
    
    try {
      const body = await request.json();
      sessionDuration = body.sessionDuration || null;
      reason = body.reason || 'manual';
    } catch {
      // Se não conseguir fazer parse do JSON, usar valores padrão
    }

    // Calcular duração da sessão se não fornecida (baseado no updatedAt)
    if (!sessionDuration) {
      const sessionStart = new Date(user.updatedAt);
      const sessionEnd = new Date();
      sessionDuration = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60)); // em minutos
    }

    // Atualizar informações do usuário
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date()
      },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        updatedAt: true
      }
    });

    // Buscar estatísticas da sessão
    const sessionStats = {
      loginAt: user.updatedAt,
      logoutAt: updatedUser.updatedAt,
      duration: sessionDuration,
      reason: reason
    };

    // Buscar atividades recentes do usuário (últimas 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentActivities = await Promise.all([
      // Aulas concluídas recentemente
      prisma.userLecture.count({
        where: {
          userId: user.id
        }
      }),
      // Exames realizados recentemente
      prisma.exam.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: yesterday
          }
        }
      }),
      // Certificados obtidos recentemente
      prisma.certificate.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: yesterday
          }
        }
      })
    ]);

    const [recentLectures, recentExams, recentCertificates] = recentActivities;

    const logoutResponse = {
      message: "Logout realizado com sucesso",
      user: {
        id: updatedUser.id,
        clerkId: updatedUser.clerkId,
        name: updatedUser.name,
        email: updatedUser.email
      },
      session: sessionStats,
      recentActivity: {
        lecturesCompleted: recentLectures,
        examsCompleted: recentExams,
        certificatesEarned: recentCertificates,
        period: "last 24 hours"
      },
      logoutAt: new Date().toISOString()
    };

    return successResponse(logoutResponse);
  } catch (error) {
    console.error("Erro no logout:", error);
    return serverErrorResponse("Erro interno no processo de logout");
  }
}