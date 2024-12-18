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
    return await prisma.certificate.findFirst({
      where: { AND: [{ courseCmsId: courseId }, { userId }] },
    });
  } catch (error) {
    throw new Error("Error when create certificates");
  }
};
