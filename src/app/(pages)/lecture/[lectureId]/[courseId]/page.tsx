import { getCourseById } from "@/actions/courses/getId";
import { getLectureById } from "@/actions/lecture/getLectureById";
import { getQuizByLectureId } from "@/actions/quiz/getByLectureId";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import CompleteLectureButton from "@/components/CompleteLectureButton";
import { LecturePageSerializer } from "@/serializers/course";
import { ChevronLeft } from "lucide-react";
import { PortableText } from "next-sanity";
import Link from "next/link";

type LecturePageProps = {
  params: {
    lectureId: string;
    courseId: string;
  };
};

const LecturePage = async ({ params }: LecturePageProps) => {
  const { lectureId, courseId } = params;

  const quiz = await getQuizByLectureId({ lectureId });

  const lecture = await getLectureById({ id: lectureId });

  const course = await getCourseById({ id: courseId });
  const user = await getUserByClerk();

  return (
    <div className="flex flex-col">
      <Link href={`/course/${courseId}`}>
        <div className="p-5 flex items-center border-b border-border text-primary justify-between">
          <ChevronLeft size={32} />

          <p className="text-xl text-primary">{lecture.title}</p>
        </div>
      </Link>
      <div className="h-[92svh] overflow-y-auto pb-20 max-w-[800px] mx-auto">
        <div className="p-5">
          <PortableText
            value={lecture.content}
            components={LecturePageSerializer}
          />
        </div>

        {!quiz ? (
          <CompleteLectureButton
            course={course}
            lectureId={lectureId}
            userId={user?.id!}
          />
        ) : (
          <Link
            href={`/exam/${courseId}/${lectureId}`}
            className="absolute bottom-0 left-0 w-full "
          >
            <div className="flex flex-col justify-center items-center bg-primary h-20 max-w-[800px] mx-auto rounded">
              <p className="font-semibold text-background text-2xl">
                Questionário
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default LecturePage;
