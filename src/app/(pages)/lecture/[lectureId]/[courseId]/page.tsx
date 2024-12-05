import { courseLectures } from "@/mock/lectures";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type LecturePageProps = {
  params: {
    lectureId: string;
    courseId: string;
  };
};

const LecturePage = ({ params }: LecturePageProps) => {
  const { lectureId, courseId } = params;

  const lecture = courseLectures.filter(
    (lecture) => lecture.id == lectureId
  )[0];

  return (
    <div className="flex flex-col">
      <Link href={`/course/${courseId}`}>
        <div className="p-5 flex items-center border-b border-border text-primary justify-between">
          <ChevronLeft size={32} />

          <p className="text-xl text-primary">{lecture.title}</p>
        </div>
      </Link>
      <div className="h-[92svh] overflow-y-auto pb-20">
        <p className="p-5">{lecture.content}</p>

        <Link
          href={`/exam/${courseId}/${lectureId}`}
          className="absolute bottom-0 left-0 w-full"
        >
          <div className="flex flex-col justify-center items-center bg-primary h-20">
            <p className="font-semibold text-background text-2xl">
              Questionário
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default LecturePage;
