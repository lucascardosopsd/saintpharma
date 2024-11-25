import { getCourseById } from "@/actions/courses/getId";
import { getQuizByCourseId } from "@/actions/quiz/getByCourseId";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import Exam from "@/components/Exam";
import { redirect } from "next/navigation";

type QuizPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

const QuizPage = async ({ params }: QuizPageProps) => {
  const { courseId } = await params;
  const user = await getUserByClerk();
  const course = await getCourseById({ id: courseId });

  if (!courseId) {
    redirect("/");
  }

  const quiz = await getQuizByCourseId({ id: courseId });

  return <Exam quiz={quiz} course={course} userId={user?.id!} />;
};

export default QuizPage;
