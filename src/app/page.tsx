import { getCourses } from "@/actions/courses/get";
import CourseCard from "@/components/CourseCard";
import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";

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

  return (
    <div className="flex flex-col">
      <Header />
      <div className="h-[92svh] overflow-y-auto">
        <SearchSection defaultValue={sParams?.name} />
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 tablet:gap-2 tablet:p-2">
          {courses.map((course) => (
            <CourseCard course={course} key={course._id} />
          ))}
        </div>
      </div>
    </div>
  );
}
