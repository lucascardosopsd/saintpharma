import { getCourses } from "@/actions/courses/get";
import { getWeekPoints } from "@/actions/ranking/getWeekPoints";
import CourseCard from "@/components/CourseCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
      <Header />
      <div className="h-[92svh] overflow-y-auto">
        <SearchSection defaultValue={sParams?.name} />

        <Link href="/ranking" className="flex flex-col py-5 border">
          <p className="h-10 w-full flex items-center justify-center font-semibold text-primary leading-none">
            Conheça o Ranking <ExternalLink />
          </p>
          <p className="text-xs text-center leading-none">
            Os 50 melhores da semana ganham acesso a um curso premium
          </p>
        </Link>

        <div className="max-w-[1200px] mx-auto p-5">
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

        <Footer />
      </div>
    </div>
  );
}
