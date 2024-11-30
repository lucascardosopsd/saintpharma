"use server";
import prisma from "@/lib/prisma";
import { Certificate, Prisma } from "@prisma/client";

type FetchManyCertificatesResProps = {
  certificates: Certificate[];
  pages: number;
};

type FetchManyCertificatesProps = {
  take: number;
  page: number;
  query?: Prisma.CertificateFindManyArgs;
};

export const getManyCertificates = async <T = FetchManyCertificatesResProps>({
  page,
  take,
  query = {},
}: FetchManyCertificatesProps): Promise<T> => {
  const count = await prisma.certificate.count();
  const pages = Math.ceil(count / take);

  const skip = page * take;

  const certificates = await prisma.certificate.findMany({
    skip,
    take,
    ...query,
  });

  return {
    certificates,
    pages,
  } as T;
};
