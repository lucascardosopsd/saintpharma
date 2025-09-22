"use server";
import prisma from "@/lib/prisma";

type UserRanking = {
  userId: string;
  name: string;
  points: number;
  profileImage: string;
  position: number;
};

export const getRanking = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await prisma.user.count();

  // Get paginated users with their points, ordered by points descending
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      points: true,
      profileImage: true,
    },
    orderBy: {
      points: "desc",
    },
    skip,
    take: limit,
  });

  // Transform to ranking format
  const ranking: UserRanking[] = users.map((user, index) => ({
    userId: user.id,
    name: user.name || "Usuário",
    points: user.points || 0,
    profileImage: user.profileImage || "",
    position: skip + index + 1, // Calculate actual position in ranking
  }));

  return {
    data: ranking,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
};
