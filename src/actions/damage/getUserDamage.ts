"use server";

import prisma from "@/lib/prisma";

type GetUserDamage = {
  from: Date;
  userId: string;
};

export const getUserDamage = async ({ userId, from }: GetUserDamage) => {
  try {
    return prisma.damage.findMany({
      where: {
        AND: [
          { userId },
          {
            createdAt: {
              gte: from,
              lte: new Date(),
            },
          },
        ],
      },
    });
  } catch (error) {
    throw new Error("Error when get user damage");
  }
};
