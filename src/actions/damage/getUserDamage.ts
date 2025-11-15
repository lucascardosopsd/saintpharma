"use server";

import prisma from "@/lib/prisma";

type GetUserDamage = {
  from: Date;
  userId: string;
};

export const getUserDamage = async ({ userId, from }: GetUserDamage) => {
  try {
    const damage = await prisma.damage.findMany({
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
      orderBy: {
        createdAt: "desc", // Garantir ordem para pegar o último
      },
    });

    // Next.js 15: Serializar objetos Prisma para garantir compatibilidade
    return JSON.parse(JSON.stringify(damage));
  } catch (error) {
    throw new Error("Error when get user damage");
  }
};
