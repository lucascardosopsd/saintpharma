"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function deleteAccount() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado no banco de dados");
    }

    // Deletar todos os dados relacionados ao usuário no banco
    await prisma.$transaction(async (tx) => {
      // Deletar danos do usuário
      await tx.damage.deleteMany({
        where: { userId: user.id },
      });

      // Deletar certificados do usuário
      await tx.certificate.deleteMany({
        where: { userId: user.id },
      });

      // Deletar aulas do usuário
      await tx.userLecture.deleteMany({
        where: { userId: user.id },
      });

      // Deletar exames do usuário
      await tx.exam.deleteMany({
        where: { userId: user.id },
      });

      // Deletar o usuário
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    // Deletar usuário do Clerk
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    throw new Error("Erro ao excluir conta. Tente novamente.");
  }
}
