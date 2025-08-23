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
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <UserProfile
        user={serializedUser}
        serverClerkUser={serializedClerkUser}
        points={points}
      />
    </div>
  );
}
