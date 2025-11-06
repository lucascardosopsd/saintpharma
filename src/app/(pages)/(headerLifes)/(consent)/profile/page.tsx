// Assuming this is your profile page
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import UserProfile from "@/components/UserProfile";
import { requireAuth } from "@/lib/authGuard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const clerkUser = await requireAuth();
  const user = await getUserByClerk();

  // Calculate points or get them from somewhere
  const points = user?.points || 0;

  if (!user || !clerkUser) {
    return <div>User not found</div>;
  }

  const serializedUser = JSON.parse(JSON.stringify(user));
  const serializedClerkUser = JSON.parse(JSON.stringify(clerkUser));

  return (
    <div className="min-h-[92svh] flex items-center justify-center">
      <div className="container max-w-4xl mx-auto py-8 w-full">
        <div className="px-5 md:px-0 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Meu Perfil
              </h1>
              <p className="text-muted-foreground">
                Gerencie suas informações pessoais e configurações
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Início
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-5 md:px-0 mx-auto flex justify-center">
          <UserProfile
            user={serializedUser}
            serverClerkUser={serializedClerkUser}
            points={points}
          />
        </div>
      </div>
    </div>
  );
}
