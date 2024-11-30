import { getManyCertificates } from "@/actions/certification/getManyCertificates";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Certificate, User } from "@prisma/client";

import { startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const ProfilePage = async () => {
  const today = new Date();

  const firstDayOfWeek = startOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

  const lastDayOfWeek = endOfWeek(today, { locale: ptBR, weekStartsOn: 0 });

  const { certificates } = await getManyCertificates<CustomCertificatesReturn>({
    page: 0,
    take: 50,
    query: {
      where: {
        createdAt: {
          lte: new Date(lastDayOfWeek),
          gte: new Date(firstDayOfWeek),
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
      points: user.points,
      profileImage: user.profileImage!,
    };

    return acc;
  }, {});

  const sortedUsers = Object.values(userPoints).sort(
    (a, b) => b.points - a.points
  );

  return (
    <div className="h-[92svh] overflow-y-auto w-full flex flex-col items-center p-5">
      <p className="text-4xl font-bold text-primary">Ranking</p>
      <p className="text-lg text-primary">Os 50 melhores</p>
      <p className="text-muted-foreground">Últimos 7 Dias</p>

      {sortedUsers.map((user, index) => (
        <Card className="w-full mt-5">
          <CardHeader className="flex-row justify-between w-full">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">#{index + 1}</p>

              <Separator orientation="vertical" />

              {user.profileImage ? (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profileImage} />
                </Avatar>
              ) : (
                <div className="rounded-full h-16 w-16 relative flex items-center justify-center border border-primary">
                  <p className="text-4xl text-primary font-bold">
                    {user.name[0]}
                  </p>
                </div>
              )}

              <p className="text-primary font-bold">{user.name}</p>
            </div>

            <p className="font-bold flex items-center">{user.points} Pts</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default ProfilePage;
