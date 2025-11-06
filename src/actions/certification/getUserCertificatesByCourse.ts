"use server";
import prisma from "@/lib/prisma";

export const getUserCertificateByCourse = async ({
  courseId,
  userId,
}: {
  courseId: string;
  userId: string;
}) => {
  try {
    const certificate = await prisma.certificate.findFirst({
      where: { AND: [{ courseCmsId: courseId }, { userId }] },
    });

    if (!certificate) {
      return null;
    }

    // Serializar o objeto Prisma para garantir que seja enviado corretamente ao cliente
    return JSON.parse(JSON.stringify(certificate));
  } catch (error) {
    console.error("[getUserCertificateByCourse] Erro ao buscar certificado:", error);
    throw new Error("Erro ao buscar certificado");
  }
};
