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

  let user = await prisma.user.findUnique({ 
    where: { clerkId: clerk.id },
    select: {
      id: true,
      clerkId: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      quizzes: true,
      points: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  // If user doesn't exist in database but exists in Clerk, create it
  if (!user) {
    try {
      const primaryEmail = clerk.emailAddresses.find(
        (email) => email.id === clerk.primaryEmailAddressId
      );
      
      // Criar usuário com firstName e lastName
      const firstName = clerk.firstName || 'Usuário';
      const lastName = clerk.lastName || null;

      user = await prisma.user.create({
        data: {
          clerkId: clerk.id,
          firstName: firstName,
          lastName: lastName,
          email: primaryEmail?.emailAddress || '',
          profileImage: clerk.imageUrl,
          points: 0,
        },
        select: {
          id: true,
          clerkId: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          quizzes: true,
          points: true,
          createdAt: true,
          updatedAt: true,
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

// Function to get user directly by clerkId from database (for API routes)
export const getUserByClerkId = async (clerkId: string) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        quizzes: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Serialize the Prisma result to a plain object
    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    console.error('Error fetching user by clerkId:', error);
    return null;
  }
};

// Function to get user by database ID (for public certificate pages)
export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        quizzes: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Serialize the Prisma result to a plain object
    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    console.error('Error fetching user by id:', error);
    return null;
  }
};
