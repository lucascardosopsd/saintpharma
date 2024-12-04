import prisma from "@/lib/prisma";

import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";

const Page = async () => {
  const user = await getUserByClerk();

  const certificates = await prisma.certificate.findMany({
    where: { userId: user?.id! },
  });

  return (
    <div className="flex flex-col gap-2 h-[92svh] overflow-y-auto p-5">
      <p className="text-2xl font-semibold text-primary">Certificados</p>
      {certificates.map((certificate) => (
        <Link href={`/certificate/${certificate.id}`} key={certificate.id}>
          <Card className="cursor-pointer group hover:bg-primary transition">
            <CardHeader>
              <CardTitle className="flex justify-between font-normal items-center group-hover:text-background">
                <div className="flex gap-2 items-center">
                  <p className="font-semibold">{certificate.courseTitle}</p>
                  <p>|</p>
                  <p>{certificate.workload}(Hrs)</p>
                </div>
                <p>{format(new Date(certificate!.createdAt), "dd/MM/yyyy")}</p>
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default Page;
