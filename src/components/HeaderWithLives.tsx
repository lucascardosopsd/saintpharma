"use server";

import { getUserLives } from "@/actions/user/getUserLives";
import Header from "./Header";
import { headers } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { subHours } from "date-fns";
import { defaultLifes } from "@/constants/exam";

const HeaderWithLives = async () => {
  // Fetch all data on the server
  const userLives = await getUserLives();
  const headersList = headers();
  const pathname = headersList.get("x-current-path") || "";

  // Get Clerk user
  const clerkUser = await currentUser();

  // Get user from database
  const user = await getUserByClerk();

  // Get user damage if user exists
  let damage = 0;
  if (user?.id) {
    const userDamage = await getUserDamage({
      userId: user.id,
      from: subHours(new Date(), 10),
    });
    damage = userDamage?.length || 0;
  }

  // Calculate remaining lives
  const remainingLives = defaultLifes - damage;

  // Check if we're on a lesson page
  const isLessonPage = pathname.startsWith("/lecture/");

  // Serialize the data to avoid "Only plain objects..." error
  const serializedClerkUser = clerkUser
    ? JSON.parse(JSON.stringify(clerkUser))
    : null;
  const serializedUser = user ? JSON.parse(JSON.stringify(user)) : null;

  return (
    <Header
      userLives={userLives}
      isLessonPage={isLessonPage}
      clerkUser={serializedClerkUser}
      user={serializedUser}
      damage={damage}
      remainingLives={remainingLives}
    />
  );
};

export default HeaderWithLives;
