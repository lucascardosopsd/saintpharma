import { getCourses } from "@/actions/courses/get";
import { getWeekPoints } from "@/actions/ranking/getWeekPoints";
import CourseCard from "@/components/CourseCard";
import SearchSection from "@/components/SearchSection";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="flex flex-col">
      <div className="h-[92svh] overflow-y-auto flex flex-col justify-between ">
        <div>
          <SearchSection defaultValue={sParams?.name} />

          <Link href="/ranking" className="flex flex-col py-5 border">
            <p className="h-10 w-full flex items-center justify-center font-semibold text-primary leading-none">
              Conheça o Ranking <ExternalLink />
            </p>
            <p className="text-xs text-center leading-none">
              Os 50 melhores da semana ganham acesso a um curso premium
            </p>
          </Link>
        </div>

        <div className="max-w-[1200px] mx-auto p-5 w-full h-full">
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 tablet:gap-2 tablet:p-2 gap-5">
            {courses.map((course) => (
              <CourseCard
                course={course}
                key={course._id}
                userPoints={userPoints}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
