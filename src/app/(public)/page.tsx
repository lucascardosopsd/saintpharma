import { getCourses } from "@/actions/courses/get";
import { getWeekPoints } from "@/actions/ranking/getWeekPoints";
import { getCoursesProgress } from "@/actions/courses/getCoursesProgress";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import CourseCard from "@/components/CourseCard";
import SearchSection from "@/components/SearchSection";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    name: string;
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  const sParams = await searchParams;
  let courses = await getCourses();

  if (sParams?.name) {
    courses = courses.filter((course) =>
      course.name.toLowerCase().includes(sParams.name.toLocaleLowerCase())
    );
  }

  const userPoints = await getWeekPoints();

  // Buscar progresso dos cursos se o usuário estiver logado
  const user = await getUserByClerk();
  const coursesProgress = user
    ? await getCoursesProgress({ courses, userId: user.id })
    : {};

  return (
    <div className="flex flex-col min-h-[92svh]">
      <SearchSection defaultValue={sParams?.name} />

      <div className="container py-8">
        <Link 
          href="/ranking" 
          className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 mb-12"
        >
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-primary">
              Conheça o Ranking
            </p>
            <ExternalLink className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Os 50 melhores da semana ganham acesso a um curso premium
          </p>
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {courses.length > 0 ? 'Cursos Disponíveis' : 'Nenhum curso encontrado'}
          </h2>
          {sParams?.name && (
            <p className="text-sm text-muted-foreground">
              Resultados para: <span className="font-semibold text-primary">{sParams.name}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              course={course}
              key={course._id}
              userPoints={userPoints}
              progress={coursesProgress[course._id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
