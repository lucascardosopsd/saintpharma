import { getQuizByCourseId } from "@/actions/quiz/getByCourseId";
import Header from "@/components/Header";
import { useClerkUser } from "@/hooks/clerkUser";
import { redirect } from "next/navigation";

type QuizPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

const QuizPage = async ({ params }: QuizPageProps) => {
  const { courseId } = await params;

  if (!courseId) {
    redirect("/");
  }

  const quiz = await getQuizByCourseId({ id: courseId });
  const user = await useClerkUser();

  return (
    <div>
      <Header user={user} backIcon />
    </div>
  );
};

export default QuizPage;
