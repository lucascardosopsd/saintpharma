import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const getUserByClerk = async () => {
  try {
    const clerk = await currentUser();
    return await prisma.user.findUnique({ where: { clerkId: clerk?.id } });
  } catch (_) {
    throw new Error("Error when get user by clerk id");
  }
};
