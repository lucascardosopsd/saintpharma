import { getCourseById } from "@/actions/courses/getId";
import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import CourseCertificateButton from "@/components/CourseCertificateButton";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type CoursePageProps = {
  params: {
    id: string;
  };
};

const CoursePage = async ({ params }: CoursePageProps) => {
  const { id } = params;
  const user = await getUserByClerk();

  if (!id || !user) {
    redirect("/");
  }

  const course = await getCourseById({ id: id });

  if (!course) {
    return <>Curso não encontrado</>;
  }

  const userLectures = await getUserLectures({ userId: user?.id });

  const userCurrentCourseLectures = userLectures?.filter(
    (userLecture) => userLecture.courseId == course._id
  );

  const courseLectures = await getLecturesByCourseId({
    courseId: course._id,
  });

  const certificateAvailable =
    userCurrentCourseLectures?.length == courseLectures?.length;

  return (
    <div>
      <div className="w-full max-w-[1200px] mx-auto h-[92svh] overflow-y-auto pb-25">
        <div className="h-[250px] w-full relative flex items-end  group overflow-hidden">
          <Image
            src={course.banner.asset.url}
            alt="Imagem curso"
            height={1000}
            width={1000}
            className="w-full h-full  object-cover absolute -z-50 left-0 top-0 group-hover:scale-125 transition-all"
          />

          <div className="h-full w-full absolute left-0 top-0 bg-gradient-to-t via-transparent from-primary to-transparent z-10 tablet:rounded" />
        </div>

        <div className="flex justify-between bg-primary p-5 text-background">
          <p className="text-2xl font-bold">{course.name}</p>
          <p className="text-2xl">{course.workload}Hrs</p>
        </div>

        <div className="p-5 flex flex-col gap-2 ">
          <p className="text-muted-foreground text-xs">
            Complete as aulas para emitir o certificado
          </p>
          {courseLectures &&
            courseLectures.map((lecture, index) => {
              const isCompleted = userLectures.some(
                (userLecture) => userLecture.lectureCmsId == lecture._id
              );

              return (
                <Link
                  href={`/lecture/${lecture._id}/${course._id}`}
                  key={lecture._id}
                >
                  <Card
                    className={cn(
                      "hover:bg-primary transition group cursor-pointer relative",
                      isCompleted && "bg-primary"
                    )}
                  >
                    <CardHeader
                      className={cn(
                        "flex flex-row justify-between items-center text-primary",
                        isCompleted && "text-background"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xl font-semibold group-hover:text-background transition flex items-center gap-2",
                          isCompleted && "text-background"
                        )}
                      >
                        Aula {index + 1}: {lecture.title}{" "}
                        {isCompleted && (
                          <span className="h-5 w-5 rounded-full flex items-center justify-center bg-background">
                            <Check size={16} className="text-primary" />
                          </span>
                        )}
                      </p>

                      <ChevronRight
                        size={32}
                        className={cn(
                          "group-hover:text-background transition",
                          isCompleted && "text-background"
                        )}
                      />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
        </div>

        <CourseCertificateButton
          course={course}
          disabled={certificateAvailable}
          userId={user.id}
        />
      </div>
    </div>
  );
};

export default CoursePage;
