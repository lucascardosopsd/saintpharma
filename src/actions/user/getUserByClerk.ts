"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const getUserByClerk = async () => {
  const clerk = await currentUser();
  return await prisma.user.findUnique({ where: { clerkId: clerk?.id } });
};
