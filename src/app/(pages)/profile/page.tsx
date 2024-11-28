import { getClerkUser } from "@/actions/user/getClerkUser";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import UserProfile from "@/components/UserProfile";

const ProfilePage = async () => {
  const clerkUser = await getClerkUser();
  const user = await getUserByClerk();

  return (
    <div className="h-[92svh] w-full flex items-center justify-center">
      <UserProfile user={user!} serverClerkUser={clerkUser} />
    </div>
  );
};

export default ProfilePage;
