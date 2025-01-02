import { getCourseById } from "@/actions/courses/getId";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { getExamById } from "@/actions/exam/getExamById";
import { getQuizByLectureId } from "@/actions/quiz/getByLectureId";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import Exam from "@/components/Exam";
import { defaultLifes } from "@/constants/exam";
import { subHours } from "date-fns";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type LecturePageProps = {
  params: {
    courseId: string;
    lectureId: string;
    id: string;
  };
};

const LecturePage = async ({ params }: LecturePageProps) => {
  const { courseId, lectureId } = params;

  const quiz = await getQuizByLectureId({ lectureId });

  const course = await getCourseById({ id: courseId });

  const user = await getUserByClerk();

  const exam = await getExamById({ id: params.id });

  const userDamage = await getUserDamage({
    userId: user?.id!,
    from: subHours(new Date(), 6),
  });

  return (
    <div className="flex flex-col">
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
    </div>
  );
};

export default LecturePage;
