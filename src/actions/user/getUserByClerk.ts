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

  let user = await prisma.user.findUnique({ where: { clerkId: clerk.id } });
  
  // If user doesn't exist in database but exists in Clerk, create it
  if (!user) {
    try {
      const primaryEmail = clerk.emailAddresses.find(
        (email) => email.id === clerk.primaryEmailAddressId
      );
      
      user = await prisma.user.create({
        data: {
          clerkId: clerk.id,
          name: clerk.firstName && clerk.lastName 
            ? `${clerk.firstName} ${clerk.lastName}` 
            : clerk.username || 'Usuário',
          email: primaryEmail?.emailAddress || '',
          profileImage: clerk.imageUrl,
        },
      });
      
      console.log(`Created user in database for Clerk ID: ${clerk.id}`);
    } catch (error) {
      console.error('Error creating user in database:', error);
      return null;
    }
  }
  
  // Serialize the Prisma result to a plain object
  return user ? JSON.parse(JSON.stringify(user)) : null;
};
