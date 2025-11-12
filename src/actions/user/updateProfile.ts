"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { updateUser } from "./updateUser";
import { getUserByClerk } from "./getUserByClerk";

type UpdateProfileProps = {
  firstName: string;
  lastName?: string;
};

export const updateProfile = async ({
  firstName,
  lastName,
}: UpdateProfileProps) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Validar firstName
    if (!firstName || firstName.trim().length === 0) {
      throw new Error("Primeiro nome é obrigatório");
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName?.trim() || undefined;

    // Atualizar no Clerk
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    });

    // Buscar usuário no banco
    const user = await getUserByClerk();

    if (!user) {
      throw new Error("Usuário não encontrado no banco de dados");
    }

    // Atualizar no banco de dados
    await updateUser({
      userId: user.id,
      data: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};

