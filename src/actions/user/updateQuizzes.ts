"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

type UpdateQuizzesProps = {
  quizId: string;
};

export const updateQuizzes = async ({ quizId }: UpdateQuizzesProps) => {
  try {
    const clerkUser = await currentUser();

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser?.id },
    });

    await prisma.user.update({
      where: { id: user?.id! },
      data: { quizzes: [...(user?.quizzes || []), quizId] },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error when update quizzes");
  }
};
