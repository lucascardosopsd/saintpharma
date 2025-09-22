import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/login
 * Autentica um usuário via Clerk e retorna informações do usuário
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 *
 * Body:
 * - clerkUserId: ID do usuário no Clerk
 * - sessionToken: Token de sessão do Clerk (opcional)
 * - createIfNotExists: boolean (padrão: true) - cria usuário se não existir
 */
export async function POST(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { clerkUserId, sessionToken, createIfNotExists = true } = body;

    if (!clerkUserId) {
      return new Response(
        JSON.stringify({
          error: "clerkUserId é obrigatório",
          code: "MISSING_CLERK_USER_ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o usuário existe no Clerk
    let clerkUser;
    try {
      const client = await clerkClient();
      clerkUser = await client.users.getUser(clerkUserId);
    } catch (clerkError: any) {
      console.error("Erro ao buscar usuário no Clerk:", clerkError);
      return new Response(
        JSON.stringify({
          error: "Usuário não encontrado no Clerk",
          code: "CLERK_USER_NOT_FOUND",
          clerkError: clerkError.message,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar ou criar usuário no banco de dados local
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user && createIfNotExists) {
      // Criar usuário no banco de dados local
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      );

      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          name:
            clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.username || "Usuário",
          email:
            clerkUser.emailAddresses.find(
              (email: { id: string; emailAddress: string }) =>
                email.id === clerkUser.primaryEmailAddressId
            )?.emailAddress || "",
          profileImage: clerkUser.imageUrl,
        },
      });
    } else if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado no banco de dados" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Atualizar última atividade do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date(),
      },
    });

    // Buscar estatísticas do usuário
    const totalCourses = 0; // Modelo Course não existe no Prisma

    // Buscar ranking do usuário
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        profileImage: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const userRanking = allUsers.findIndex((u) => u.id === user.id) + 1;
    const userPoints = 0; // Points não existe no modelo User
    const lastLogin = user.updatedAt;

    const loginResponse = {
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        points: userPoints,
      },
      clerk: {
        id: clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        imageUrl: clerkUser.imageUrl,
        lastSignInAt: clerkUser.lastSignInAt,
        lastActiveAt: clerkUser.lastActiveAt,
        createdAt: clerkUser.createdAt,
        lastLoginAt: lastLogin,
      },
      stats: {
        totalCourses,
        ranking: userRanking,
        points: userPoints,
        lastLogin,
      },
      session: {
        loginAt: new Date().toISOString(),
        sessionToken: sessionToken || null,
      },
    };

    return successResponse(loginResponse);
  } catch (error) {
    console.error("Erro no login:", error);
    return serverErrorResponse("Erro interno no processo de login");
  }
}
