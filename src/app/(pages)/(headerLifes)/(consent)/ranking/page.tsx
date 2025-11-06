import { getRanking } from "@/actions/ranking/get";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/authGuard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ProfilePage = async () => {
  await requireAuth();
  const rankingResult = await getRanking();
  const ranking = rankingResult.data;

  revalidatePath("/ranking");

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400 fill-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600 fill-amber-600" />;
    return null;
  };

  const getRankBadgeVariant = (index: number) => {
    if (index === 0) return "default";
    if (index === 1) return "secondary";
    if (index === 2) return "outline";
    return "outline";
  };

  return (
    <div className="min-h-[92svh]">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="px-5 md:px-0 mb-8">
          <div className="text-center mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Ranking
            </h1>
            <p className="text-xl text-primary font-semibold mb-2">
              Os 50 melhores da semana
            </p>
            <p className="text-muted-foreground capitalize">
              Do mês de {format(new Date(), "LLLL", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Ranking List */}
        <div className="px-5 md:px-0 space-y-3">
          {ranking.map((user: any, index: number) => {
            const isTopThree = index < 3;
            
            return (
              <Card 
                className={cn(
                  "w-full transition-all duration-300 hover:shadow-lg",
                  isTopThree && "border-primary/50 shadow-md"
                )} 
                key={index}
              >
                <CardHeader className="flex flex-row justify-between items-center p-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isTopThree ? (
                        <div className="flex-shrink-0">
                          {getRankIcon(index)}
                        </div>
                      ) : (
                        <Badge 
                          variant={getRankBadgeVariant(index)}
                          className="w-10 h-10 rounded-full flex items-center justify-center p-0 text-base font-bold"
                        >
                          {index + 1}
                        </Badge>
                      )}
                    </div>

                    {user.profileImage ? (
                      <Avatar className="h-14 w-14 flex-shrink-0">
                        <AvatarImage src={user.profileImage} />
                      </Avatar>
                    ) : (
                      <div className="rounded-full h-14 w-14 relative flex items-center justify-center border-2 border-primary bg-primary/10 flex-shrink-0">
                        <p className="text-2xl text-primary font-bold">
                          {user.name[0]?.toUpperCase()}
                        </p>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-bold text-lg truncate",
                        isTopThree ? "text-primary" : "text-foreground"
                      )}>
                        {user.name}
                      </p>
                      {isTopThree && (
                        <p className="text-sm text-muted-foreground">
                          {index === 0 && "🥇 1º Lugar"}
                          {index === 1 && "🥈 2º Lugar"}
                          {index === 2 && "🥉 3º Lugar"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="default" className="text-lg font-bold px-4 py-2">
                      {user.points} Pts
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
