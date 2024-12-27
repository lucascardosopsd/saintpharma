"use server";

import prisma from "@/lib/prisma";

type CreateDamageProps = {
  userId: string;
};

export const createDamage = async ({ userId }: CreateDamageProps) => {
  try {
    return prisma.damage.create({ data: { userId } });
  } catch (error) {
    throw new Error("error when create damage");
  }
};
