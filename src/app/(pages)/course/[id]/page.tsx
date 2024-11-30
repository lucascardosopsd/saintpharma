import { getCourseById } from "@/actions/courses/getId";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { getQuizByCourseId } from "@/actions/quiz/getByCourseId";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { coursePageSerializer } from "@/serializers/course";
import { getWeekPoints } from "@/actions/ranking/getWeekPoints";

type CoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const CoursePage = async ({ params }: CoursePageProps) => {
  const { id } = await params;

  if (!id) {
    redirect("/");
  }

  const weekPoints = await getWeekPoints();

  const course = await getCourseById({ id });

  if (course.premiumPoints > weekPoints) {
    redirect("/");
  }

  const quiz = await getQuizByCourseId({ id: course._id });

  const user = await getUserByClerk();

  const isQuizCompleted = user?.quizzes.some(
    (userQuiz) => userQuiz == quiz._id
  );

  return (
    <div>
      <div className="w-full max-w-[1200px] mx-auto h-[90svh] overflow-y-auto ">
        <div className="h-[250px] w-full relative flex items-end  group overflow-hidden cursor-pointer">
          <Image
            src={course.banner.asset.url}
            alt="Imagem curso"
            height={1000}
            width={1000}
            className="w-full h-full  object-cover absolute -z-50 left-0 top-0 group-hover:scale-125 transition-all"
          />

          <div className="h-full w-full absolute left-0 top-0 bg-gradient-to-t from-primary to-transparent z-10 tablet:rounded" />
        </div>

        <div className="flex justify-between bg-primary p-5 w-full z-50 text-background font-semibold">
          <p className="text-semibold">{course.name}</p>
          <p className="text-semibold">{course.workload} hrs</p>
        </div>

        <div className="p-5">
          <PortableText
            value={course.content}
            components={coursePageSerializer}
          />
        </div>

        <Separator orientation="horizontal" />

        <div className="flex flex-col w-full items-center justify-center h-[400px] max-w-[500px] mx-auto px-5">
          {isQuizCompleted ? (
            <>
              <p className="text-2xl text-primary font-semibold">
                Você ja recebeu o certificado.
              </p>
            </>
          ) : (
            <>
              <SignedIn>
                <p className="text-2xl text-primary font-semibold">
                  Curso concluído
                </p>
                <p>Garanta seu certificado</p>
                <Link href={`/quiz/${id}`} className="w-full">
                  <Button size="lg" className="w-full text-lg">
                    Certificar
                  </Button>
                </Link>
              </SignedIn>

              <SignedOut>
                <p className="text-2xl text-primary font-semibold">
                  Curso concluído
                </p>
                <p>Faça login para a certificação</p>
                <Link href="/sign-in" className="w-full">
                  <Button size="lg" className="w-full text-lg">
                    Entrar
                  </Button>
                </Link>
              </SignedOut>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
