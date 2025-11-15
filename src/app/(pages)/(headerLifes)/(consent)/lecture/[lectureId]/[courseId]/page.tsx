import { getCourseById } from "@/actions/courses/getId";
import { getUserDamage } from "@/actions/damage/getUserDamage";
import { getExamByLectureId } from "@/actions/exam/getExamByLectureId";
import { getLectureById } from "@/actions/lecture/getLectureById";
import { getQuizByLectureId } from "@/actions/quiz/getByLectureId";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import CompleteLectureButton from "@/components/CompleteLectureButton";
import NewExamButton from "@/components/NewExamButton";
import { defaultLifes } from "@/constants/exam";
import { requireAuth } from "@/lib/authGuard";
import { LecturePageSerializer } from "@/serializers/course";
import { subHours } from "date-fns";
import { PortableText } from "next-sanity";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type LecturePageProps = {
  params: Promise<{
    lectureId: string;
    courseId: string;
  }>;
};

const LecturePage = async ({ params }: LecturePageProps) => {
  await requireAuth();
  
  // Next.js 15: params agora é uma Promise e precisa ser aguardado
  // Next.js 15: revalidatePath não pode ser usado durante o render
  // A revalidação deve ser feita em Server Actions quando necessário
  const { lectureId, courseId } = await params;
  const exam = await getExamByLectureId({ lectureId });

  const quiz = await getQuizByLectureId({ lectureId });

  const lecture = await getLectureById({ id: lectureId });

  const course = await getCourseById({ id: courseId });

  const user = await getUserByClerk();

  const userDamage = await getUserDamage({
    userId: user?.id!,
    from: subHours(new Date(), 12),
  });

  return (
    <div className="min-h-[92svh]">
      <div className="container max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="px-5 md:px-0 pt-6 pb-4">
          <Link href={`/course/${courseId}`}>
            <Button variant="ghost" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 stroke-primary group-hover:stroke-accent-foreground transition-colors" />
              Voltar ao curso
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="px-5 md:px-0 mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 md:p-8 border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-3">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">{course.name}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {lecture.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 md:px-0 mb-12">
          <article className="max-w-none">
            <div className="[&_p]:text-foreground [&_p]:leading-relaxed [&_a]:text-primary [&_a]:font-medium hover:[&_a]:underline [&_strong]:text-foreground [&_strong]:font-semibold [&_ul]:text-foreground [&_ol]:text-foreground [&_li]:text-foreground [&_img]:rounded-xl [&_img]:shadow-lg">
              <PortableText
                value={lecture.content}
                components={LecturePageSerializer}
              />
            </div>
          </article>
        </div>

        {/* Action Buttons */}
        <div className="px-5 md:px-0 mb-12">
          <div className="bg-card rounded-xl p-6 shadow-lg border">
            {!quiz?._id ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Concluir Aula
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Após concluir esta aula, você poderá avançar para a próxima
                  </p>
                </div>
                <CompleteLectureButton
                  course={course}
                  lectureId={lectureId}
                  userId={user?.id!}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Questionário
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete o questionário para finalizar esta aula
                  </p>
                </div>
                <NewExamButton
                  courseId={courseId}
                  lectureId={lectureId}
                  userId={user?.id!}
                  exam={exam}
                  userLifes={defaultLifes - userDamage.length}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturePage;
