"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const getUserByClerk = async () => {
  const clerk = await currentUser();

  if (!clerk) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { clerkId: clerk?.id } });
  
  // Serialize the Prisma result to a plain object
  return user ? JSON.parse(JSON.stringify(user)) : null;
};
