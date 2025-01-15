"use server";
import { Certificate, User } from "@prisma/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { getManyCertificates } from "../certification/getManyCertificates";

type CustomCertificateProps = Certificate & {
  User: User;
};

type CustomCertificatesReturn = {
  certificates: CustomCertificateProps[];
  pages: number;
};

type UserPoints = {
  [key: string]: {
    userId: string;
    name: string;
    points: number;
    profileImage: string;
  };
};

export const getRanking = async () => {
  const today = new Date();

  const firstDayOfMonth = startOfMonth(today);

  const lastDayOfMonth = endOfMonth(today);

  const { certificates } = await getManyCertificates<CustomCertificatesReturn>({
    page: 0,
    take: 50,
    query: {
      where: {
        createdAt: {
          lte: new Date(lastDayOfMonth),
          gte: new Date(firstDayOfMonth),
        },
      },
      include: {
        User: true,
      },
    },
  });

  const userPoints = certificates.reduce((acc: UserPoints, certificate) => {
    const user = certificate.User;

    if (!user) return acc;

    acc[user.id] = {
      userId: user.id,
      name: user.name! || "",
      points: (acc[user.id]?.points || 0) + certificate.points,
      profileImage: user.profileImage!,
    };

    return acc;
  }, {});

  return Object.values(userPoints).sort((a, b) => b.points - a.points);
};
