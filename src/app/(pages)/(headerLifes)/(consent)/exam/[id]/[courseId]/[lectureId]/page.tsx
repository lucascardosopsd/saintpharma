import { getCourseById } from "@/actions/courses/getId";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { getExamById } from "@/actions/exam/getExamById";
import { getQuizByLectureId } from "@/actions/quiz/getByLectureId";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import Exam from "@/components/Exam";
import ModernExam from "@/components/ModernExam";
import { defaultLifes } from "@/constants/exam";
import { requireAuth } from "@/lib/authGuard";
import { subHours } from "date-fns";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type LecturePageProps = {
  params: Promise<{
    courseId: string;
    lectureId: string;
    id: string;
  }>;
};

const LecturePage = async ({ params }: LecturePageProps) => {
  await requireAuth();
  // Next.js 15: params agora é uma Promise e precisa ser aguardado
  const { courseId, lectureId, id } = await params;

  const quiz = await getQuizByLectureId({ lectureId });

  const course = await getCourseById({ id: courseId });

  const user = await getUserByClerk();

  const exam = await getExamById({ id });

  const userDamage = await getUserDamage({
    userId: user?.id!,
    from: subHours(new Date(), 6),
  });

  // Use modern exam by default, but you can switch to the old one
  const useModernExam = true;

  return (
    <div className="flex flex-col">
      {useModernExam ? (
        <ModernExam
          examId={exam?.id!}
          userId={user?.id!}
          courseId={courseId}
          lectureId={lectureId}
          userLifes={defaultLifes - userDamage.length}
        />
      ) : (
        <>
          <Link href={`/course/${courseId}`}>
            <div className="p-5 flex items-center border-b border-border text-primary">
              <ChevronLeft size={32} />
            </div>
          </Link>

          <Exam
            course={course}
            quiz={quiz}
            userId={user?.id!}
            lectureId={lectureId}
            examId={exam?.id!}
            userLifes={defaultLifes - userDamage.length}
          />
        </>
      )}
    </div>
  );
};

export default LecturePage;
