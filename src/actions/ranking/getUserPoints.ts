"use server";
import { getManyCertificates } from "../certification/getManyCertificates";
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

  const { certificates } = await getManyCertificates({
    page: 0,
    take: 1000,
    query: {
      where: {
        userId: userIdToUse,
      },
    },
  });

  return certificates.reduce((acc, certificate) => acc + certificate.points, 0);
};
