// Assuming this is your profile page
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import UserProfile from "@/components/UserProfile";
import { requireAuth } from "@/lib/authGuard";

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
        <div className="px-5 md:px-0 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações
          </p>
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
