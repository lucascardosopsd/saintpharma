"use server";
import prisma from "@/lib/prisma";
import { getUserByClerk } from "../user/getUserByClerk";

export const getUserPoints = async (userId?: string) => {
  let userIdToUse = userId;

  // If no userId provided, get it from current user (backward compatibility)
  if (!userIdToUse) {
    const user = await getUserByClerk();
    userIdToUse = user?.id;
  }

  if (!userIdToUse) {
    return 0;
  }

  // Get points directly from User model
  const user = await prisma.user.findUnique({
    where: { id: userIdToUse },
    select: { points: true },
  });

  return user?.points || 0;
};
