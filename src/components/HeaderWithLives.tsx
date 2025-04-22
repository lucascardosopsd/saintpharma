import { getUserLives } from "@/actions/user/getUserLives";
import Header from "./Header";
import { headers } from "next/headers";

const HeaderWithLives = async () => {
  const userLives = await getUserLives();
  const headersList = headers();
  const pathname = headersList.get("x-current-path") || "";

  // Check if we're on a lesson page
  const isLessonPage = pathname.startsWith("/lecture/");

  return <Header userLives={userLives} isLessonPage={isLessonPage} />;
};

export default HeaderWithLives;
