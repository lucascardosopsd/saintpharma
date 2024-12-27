"use server";

import prisma from "@/lib/prisma";

type GetExamByLectureExamProps = {
  lectureId: string;
  complete?: boolean;
  reproved?: boolean;
};

export const getExamByLectureId = async ({
  lectureId,
  complete = false,
  reproved = false,
}: GetExamByLectureExamProps) => {
  try {
    return prisma.exam.findFirst({
      where: {
        AND: [{ lectureCMSid: lectureId }, { complete }, { reproved }],
      },
    });
  } catch (error) {
    throw new Error("error when get exam by lecture Id");
  }
};
