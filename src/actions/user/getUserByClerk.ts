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

  // Buscar ou criar usuário usando upsert para evitar race conditions
  const primaryEmail = clerk.emailAddresses.find(
    (email) => email.id === clerk.primaryEmailAddressId
  );
  
  const firstName = clerk.firstName || 'Usuário';
  const lastName = clerk.lastName || null;

  try {
    const user = await prisma.user.upsert({
      where: { clerkId: clerk.id },
      update: {
        // Atualizar dados caso o usuário já exista
        firstName: firstName,
        lastName: lastName,
        email: primaryEmail?.emailAddress || '',
        profileImage: clerk.imageUrl,
      },
      create: {
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
    
    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    console.error('Error upserting user in database:', error);
    // Se ainda assim falhar, tentar buscar novamente
    const user = await prisma.user.findUnique({ 
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
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }
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
