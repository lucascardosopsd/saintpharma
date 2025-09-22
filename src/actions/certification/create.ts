"use server";
import prisma from "@/lib/prisma";
import { CourseProps } from "@/types/course";

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

    // Award points to user for completing the course
    if (course.points && course.points > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: course.points,
          },
        },
      });

      console.log(
        `[POINTS] User ${userId} earned ${course.points} points for completing course ${course._id}`
      );
    }

    console.log(
      `[CERTIFICATE] Created certificate ${certificate.id} for user ${userId} and course ${course._id}`
    );

    return certificate;
  } catch (error) {
    console.log(error);
    throw new Error("Error when create certification");
  }
};
