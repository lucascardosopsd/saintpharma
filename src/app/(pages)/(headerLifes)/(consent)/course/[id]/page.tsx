import { getCourseById } from "@/actions/courses/getId";
import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import CourseCertificateButton from "@/components/CourseCertificateButton";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireAuth } from "@/lib/authGuard";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Clock, BookOpen, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

type CoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const CoursePage = async ({ params }: CoursePageProps) => {
  // Next.js 15: params agora é uma Promise e precisa ser aguardado
  const { id } = await params;
  await requireAuth();
  const user = await getUserByClerk();

  if (!id) {
    redirect("/");
  }

  const course = await getCourseById({ id: id });

  if (!course) {
    return <>Curso não encontrado</>;
  }

  const userLectures = await getUserLectures({ userId: user?.id });

  const courseLectures = await getLecturesByCourseId({
    courseId: course._id,
  });

  const userCurrentLectures = courseLectures.filter((cLecture) =>
    userLectures.some((uLecture) => uLecture.lectureCmsId == cLecture?._id)
  );

  const certificateAvailable =
    userCurrentLectures?.length == courseLectures?.length;
  
  const progressPercentage = courseLectures.length > 0 
    ? Math.round((userCurrentLectures.length / courseLectures.length) * 100)
    : 0;

  return (
    <div className="min-h-[92svh]">
      <div className="container max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="px-5 md:px-0 pt-6 pb-4">
          <Link href="/">
            <Button variant="ghost" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 stroke-primary group-hover:stroke-accent-foreground transition-colors" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="h-[320px] md:h-[400px] w-full relative flex items-end group overflow-hidden rounded-b-xl">
          <Image
            src={course.banner.asset.url}
            alt={`Banner do curso ${course.name}`}
            height={1000}
            width={1000}
            className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/30 z-10" />

          <div className="relative z-20 w-full p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
                  {course.name}
                </h1>
                <div className="flex items-center gap-4 text-primary-foreground/90">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg font-semibold">{course.workload} horas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-lg font-semibold">{courseLectures.length} aulas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="px-5 md:px-0 mt-8 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Progresso do Curso
                </h2>
                <p className="text-sm text-muted-foreground">
                  {userCurrentLectures.length} de {courseLectures.length} aulas concluídas
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{progressPercentage}%</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </div>

        {/* Lectures Section */}
        <div className="px-5 md:px-0 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Aulas do Curso
            </h2>
            <p className="text-sm text-muted-foreground">
              Complete todas as aulas para emitir seu certificado
            </p>
          </div>

          <div className="space-y-3">
            {courseLectures.length > 0 &&
              courseLectures.map((lecture, index) => {
                const isCompleted = userLectures.some(
                  (userLecture) => userLecture.lectureCmsId == lecture?._id
                );

                return (
                  <Link
                    href={`/lecture/${lecture?._id}/${course?._id}`}
                    key={lecture?._id}
                  >
                    <Card
                      className={cn(
                        "hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden",
                        isCompleted 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "hover:border-primary"
                      )}
                    >
                      <CardHeader className="flex flex-row justify-between items-center p-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                            isCompleted 
                              ? "bg-primary-foreground text-primary" 
                              : "bg-primary/10 text-primary"
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-lg font-semibold mb-1 truncate",
                              isCompleted && "text-primary-foreground"
                            )}>
                              {lecture?.title}
                            </p>
                            <p className={cn(
                              "text-sm",
                              isCompleted 
                                ? "text-primary-foreground/80" 
                                : "text-muted-foreground"
                            )}>
                              Aula {index + 1}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isCompleted && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary-foreground">
                              <Check size={20} className="text-primary" />
                            </div>
                          )}
                          <ChevronRight
                            size={24}
                            className={cn(
                              "flex-shrink-0 transition-transform group-hover:translate-x-1",
                              isCompleted 
                                ? "text-primary-foreground" 
                                : "text-muted-foreground group-hover:text-primary"
                            )}
                          />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Certificate Button */}
        <div className="px-5 md:px-0 mb-12">
          <CourseCertificateButton
            course={course}
            disabled={certificateAvailable}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
