import prisma from "@/lib/prisma";

type getUserLecturesProps = {
  userId: string;
};

export const getUserLectures = async ({ userId }: getUserLecturesProps) => {
  try {
    return await prisma.userLecture.findMany({
      where: { userId },
    });
  } catch (error) {
    throw new Error("error when get user lectures");
  }
};
