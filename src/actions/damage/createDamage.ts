"use server";

import prisma from "@/lib/prisma";

type CreateDamageProps = {
  userId: string;
};

export const createDamage = async ({ userId }: CreateDamageProps) => {
  try {
    const damage = await prisma.damage.create({ data: { userId } });
    // Next.js 15: Serializar objeto Prisma para garantir compatibilidade
    return JSON.parse(JSON.stringify(damage));
  } catch (error) {
    throw new Error("error when create damage");
  }
};
