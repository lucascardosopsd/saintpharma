"use server";

import { currentUser } from "@clerk/nextjs/server";

export const getClerkUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching Clerk user:", error);
    return null;
  }
};
