"use server";
import prisma from "@/lib/prisma";

export const getUserCertificateByCourse = async ({
  courseId,
}: {
  courseId: string;
}) => {
  try {
    return await prisma.certificate.findFirst({
      where: { courseCmsId: courseId },
    });
  } catch (error) {
    throw new Error("Error when create certificates");
  }
};
