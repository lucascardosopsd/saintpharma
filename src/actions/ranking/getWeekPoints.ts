"use server";
import { endOfWeek, startOfWeek } from "date-fns";
import { getManyCertificates } from "../certification/getManyCertificates";
import { getUserByClerk } from "../user/getUserByClerk";
import { ptBR } from "date-fns/locale";

export const getWeekPoints = async () => {
  const user = await getUserByClerk();

  const today = new Date();

  const firstDayOfWeek = startOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

  const lastDayOfWeek = endOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

  const { certificates } = await getManyCertificates({
    page: 0,
    take: 1000,
    query: {
      where: {
        userId: user?.id!,
        createdAt: {
          lte: new Date(lastDayOfWeek),
          gte: new Date(firstDayOfWeek),
        },
      },
    },
  });

  return certificates.reduce((acc, certificate) => acc + certificate.points, 0);
};
