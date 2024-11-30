import { getManyCertificates } from "@/actions/certification/getManyCertificates";
import { getClerkUser } from "@/actions/user/getClerkUser";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import UserProfile from "@/components/UserProfile";

const ProfilePage = async () => {
  const clerkUser = await getClerkUser();
  const user = await getUserByClerk();

  const { certificates } = await getManyCertificates({
    page: 0,
    take: 1000,
    query: {
      where: {
        userId: user?.id!,
      },
    },
  });

  const points = certificates.reduce(
    (acc, certificate) => acc + certificate.points,
    0
  );

  return (
    <div className="h-[92svh] w-full flex items-center justify-center">
      <UserProfile user={user!} serverClerkUser={clerkUser} points={points} />
    </div>
  );
};

export default ProfilePage;
