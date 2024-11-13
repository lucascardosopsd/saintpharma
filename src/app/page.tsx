import CourseCard from "@/components/CourseCard";
import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import { useClerkUser } from "@/hooks/clerkUser";

export default async function Home() {
  const user = await useClerkUser();

  return (
    <div className="flex flex-col">
      <Header user={user} />
      <div className="h-[92svh] overflow-y-auto">
        <SearchSection />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
        <CourseCard />
      </div>
    </div>
  );
}
