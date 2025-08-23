"use server";

import prisma from "@/lib/prisma";
import { User, currentUser } from "@clerk/nextjs/server";

export const getUserByClerk = async (clerkUser?: User | null) => {
  let clerk = clerkUser;
  
  // If no clerkUser is provided, fetch it (backward compatibility)
  if (!clerk) {
    clerk = await currentUser();
  }
  
  if (!clerk) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { clerkId: clerk.id } });
  
  // Serialize the Prisma result to a plain object
  return user ? JSON.parse(JSON.stringify(user)) : null;
};
