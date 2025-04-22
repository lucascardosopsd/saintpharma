"use server";

import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { subHours } from "date-fns";
import { defaultLifes } from "@/constants/exam";
import { currentUser } from "@clerk/nextjs/server";

export const getUserLives = async (): Promise<number | null> => {
  try {
    // First check if user is authenticated
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const user = await getUserByClerk();

    if (!user) {
      return null;
    }

    const userDamage = await getUserDamage({
      userId: user.id,
      from: subHours(new Date(), 10),
    });

    return defaultLifes - userDamage.length;
  } catch (error) {
    console.error("Error fetching user lives:", error);
    return null;
  }
};
