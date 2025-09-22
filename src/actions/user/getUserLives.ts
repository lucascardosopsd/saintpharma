"use server";

import { getUserDamage } from "@/actions/damage/getUserDamage";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { defaultLifes } from "@/constants/exam";
import { currentUser } from "@clerk/nextjs/server";
import { subHours } from "date-fns";

export const getUserLives = async (userId?: string): Promise<number | null> => {
  try {
    let userIdToUse = userId;

    // If no userId provided, get it from current user (backward compatibility)
    if (!userIdToUse) {
      // First check if user is authenticated
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return null;
      }

      const user = await getUserByClerk();
      if (!user) {
        return null;
      }

      userIdToUse = user.id;
    }

    // Final check to ensure userIdToUse is defined
    if (!userIdToUse) {
      return null;
    }

    const userDamage = await getUserDamage({
      userId: userIdToUse,
      from: subHours(new Date(), 10),
    });

    // Calculate remaining lives, ensuring it's never negative
    const remainingLives = Math.max(0, defaultLifes - userDamage.length);

    return remainingLives;
  } catch (error) {
    console.error("Error fetching user lives:", error);
    return null;
  }
};
