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

    // Se lastName foi fornecido, atualizar o nome completo
    if (lastName) {
      const currentName = currentUser.name || "";
      const firstNamePart = firstName || currentName.split(" ")[0] || "";
      updateData.name = `${firstNamePart} ${lastName}`.trim();
    }

    // Se firstName foi fornecido e lastName não, atualizar apenas o primeiro nome
    if (firstName && !lastName) {
      const currentName = currentUser.name || "";
      const lastNamePart = currentName.split(" ").slice(1).join(" ") || "";
      updateData.name = `${firstName} ${lastNamePart}`.trim();
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        clerkId: true,
        name: true,
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
