"use server";
import prisma from "@/lib/prisma";

type CompleteUserDataProps = {
  userId: string;
  lastName?: string;
  firstName?: string;
};

export const completeUserData = async ({ 
  userId, 
  lastName, 
  firstName 
}: CompleteUserDataProps) => {
  try {
    // Buscar o usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new Error("Usuário não encontrado");
    }

    // Preparar dados para atualização
    const updateData: any = {};

    // Se lastName foi fornecido
    if (lastName) {
      const firstNamePart = firstName || currentUser.firstName || "";
      updateData.firstName = firstNamePart;
      updateData.lastName = lastName;
    }

    // Se firstName foi fornecido e lastName não
    if (firstName && !lastName) {
      updateData.firstName = firstName;
      // Manter lastName existente se houver
      if (currentUser.lastName) {
        updateData.lastName = currentUser.lastName;
      }
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Erro ao completar dados do usuário:", error);
    throw new Error("Erro ao completar dados do usuário");
  }
};
