"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

type AddUserPointsProps = {
  points: number;
};

export const addUserPoints = async ({ points }: AddUserPointsProps) => {
  try {
    const clerkUser = await currentUser();

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser?.id },
    });

    await prisma.user.update({
      where: { id: user?.id! },
      data: { points: user!.points + points },
    });
  } catch (error) {
    throw new Error("Error when add points to user");
  }
};
