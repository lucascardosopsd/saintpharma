"use server";
import prisma from "@/lib/prisma";

export const getUserCertificates = async ({ userId }: { userId: string }) => {
  try {
    return await prisma.certificate.findMany({
      where: { userId },
    });
  } catch (error) {
    throw new Error("Error when create certificates");
  }
};
