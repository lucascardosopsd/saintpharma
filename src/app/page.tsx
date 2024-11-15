import { fetchCourses } from "@/actions/courses";
import CourseCard from "@/components/CourseCard";
import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import { useClerkUser } from "@/hooks/clerkUser";

export default async function Home() {
  const user = await useClerkUser();

  const courses = await fetchCourses();

  return (
    <div className="flex flex-col">
      <Header user={user} />
      <div className="h-[92svh] overflow-y-auto">
        <SearchSection />
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 tablet:gap-2 tablet:p-2">
          {courses.map((course) => (
            <CourseCard course={course} key={course._id} />
          ))}
        </div>
      </div>
    </div>
  );
}
