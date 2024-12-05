import Exam from "@/components/Exam";
import { courses } from "@/mock/courses";
import { lectureQuizzes } from "@/mock/lectureQuizzes";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type LecturePageProps = {
  params: {
    courseId: string;
    lectureId: string;
  };
};

const LecturePage = ({ params }: LecturePageProps) => {
  const { courseId, lectureId } = params;

  const quiz = lectureQuizzes.filter((quiz) => quiz.lectureId == lectureId)[0];

  const course = courses.filter((course) => course.id == courseId)[0];

  return (
    <div className="flex flex-col">
      <Link href={`/course/${courseId}`}>
        <div className="p-5 flex items-center border-b border-border text-primary">
          <ChevronLeft size={32} />
        </div>
      </Link>

      <Exam course={course} quiz={quiz} userId="1" lectureId={lectureId} />
    </div>
  );
};

export default LecturePage;
