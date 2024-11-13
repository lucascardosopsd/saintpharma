import Header from "@/components/Header";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="flex flex-col">
      <Header user={JSON.parse(JSON.stringify(user))} />
    </div>
  );
}
