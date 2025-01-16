"use client";

import { createUserLecture } from "@/actions/lecture/createUserLecture";
import { getUserLectureById } from "@/actions/lecture/getUserLectureById";
import { revalidateRoute } from "@/actions/revalidateRoute";
import { CourseProps } from "@/types/course";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";

type CompleteLectureButtonProps = {
  course: CourseProps;
  userId: string;
  lectureId: string;
};

const CompleteLectureButton = ({
  course,
  lectureId,
  userId,
}: CompleteLectureButtonProps) => {
  const router = useRouter();

  const completeLecture = async () => {
    const exists = await getUserLectureById({
      lectureCmsId: lectureId,
      userId,
    });

    try {
      if (!exists) {
        await createUserLecture({
          data: {
            lectureCmsId: lectureId,
            courseId: course._id,
            userId,
          },
        });
      }

      revalidateRoute({ fullPath: "/" });

      router.push(`/course/${course._id}`);
    } catch (error) {
      toast.error("Erro ao concluir a aula");
      throw new Error("Error when complete lecture");
    }
  };

  return (
    <Button
      className="absolute bottom-0 left-0 right-0 w-full rounded-b-none cursor-pointer  mx-auto"
      onClick={completeLecture}
    >
      <p className="font-semibold text-background ">Concluir</p>
    </Button>
  );
};

export default CompleteLectureButton;
