"use server";

import { CourseProps } from "@/types/course";
import prisma from "@/lib/prisma";

type CreateCertificationProps = {
  userId: string;
  course: CourseProps;
};

export const createCertificate = async ({
  userId,
  course,
}: CreateCertificationProps) => {
  try {
    return prisma.certificate.create({
      data: {
        courseCmsId: course._id,
        courseTitle: course.name,
        description: course.description,
        workload: course.workload,
        userId: userId,
      },
    });
  } catch (error) {
    throw new Error("Error when create certification");
  }
};
