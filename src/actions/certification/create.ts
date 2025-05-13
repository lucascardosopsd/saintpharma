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
    const certificate = await prisma.certificate.create({
      data: {
        courseCmsId: course._id,
        courseTitle: course.name,
        description: course.description,
        workload: course.workload,
        points: course.points,
        userId: userId,
      },
    });

    console.log(certificate);

    return certificate;
  } catch (error) {
    console.log(error);
    throw new Error("Error when create certification");
  }
};
