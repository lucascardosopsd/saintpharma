"use server";

import prisma from "@/lib/prisma";

type CreateUserProps = {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
};

export const createUser = async ({
  clerkId,
  email,
  firstName,
  lastName,
  profileImage,
}: CreateUserProps) => {
  try {
    // Verificar se o usuário já existe pelo clerkId
    const existingUserByClerk = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (existingUserByClerk) {
      throw new Error("Usuário já existe com este Clerk ID");
    }

    // Verificar se o usuário já existe pelo email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new Error("Usuário já existe com este email");
    }

    // Processar nome
    const finalFirstName: string | null = firstName?.trim() || "Usuário";
    const finalLastName: string | null = lastName?.trim() || null;

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName: finalFirstName,
        lastName: finalLastName,
        profileImage: profileImage || null,
        points: 0,
        quizzes: [],
      },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        points: true,
        quizzes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};
