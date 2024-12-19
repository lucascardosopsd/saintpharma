import { getRanking } from "@/actions/ranking/get";
import { revalidateRoute } from "@/actions/revalidateRoute";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ProfilePage = async () => {
  const ranking = await getRanking();

  await revalidateRoute({ fullPath: "/ranking" });

  return (
    <div className="h-[92svh] overflow-y-auto w-full flex flex-col items-center p-5">
      <p className="text-4xl font-bold text-primary">Ranking</p>
      <p className="text-lg text-primary">Os 50 melhores</p>
      <p className="text-muted-foreground">Últimos 7 Dias</p>

      <div className="mx-auto max-w-lg w-full">
        {ranking.map((user, index) => (
          <Card className="w-full mt-5" key={index}>
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
    </div>
  );
};

export default ProfilePage;
