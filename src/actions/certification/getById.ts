"use server";

import prisma from "@/lib/prisma";

type GetCertificateByIdProps = {
  id: string;
};

export const getCertificateById = async ({ id }: GetCertificateByIdProps) => {
  try {
    return prisma.certificate.findFirst({
      where: { id },
    });
  } catch (error) {
    throw new Error("Error when get certificate");
  }
};
