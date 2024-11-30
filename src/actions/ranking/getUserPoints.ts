"use server";
import { getManyCertificates } from "../certification/getManyCertificates";
import { getUserByClerk } from "../user/getUserByClerk";

export const getUserPoints = async () => {
  const user = await getUserByClerk();

  const { certificates } = await getManyCertificates({
    page: 0,
    take: 1000,
    query: {
      where: {
        userId: user?.id!,
      },
    },
  });

  return certificates.reduce((acc, certificate) => acc + certificate.points, 0);
};
