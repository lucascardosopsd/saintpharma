"use server";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

type UpdateUserProps = {
  userId: string;
  data: Partial<User>;
};

export const updateUser = async ({ userId: id, data }: UpdateUserProps) => {
  try {
    await prisma.user.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error when update quizzes");
  }
};
