"use client";

import { createUserLecture } from "@/actions/lecture/createUserLecture";
import { getUserLectureById } from "@/actions/lecture/getUserLectureById";
import { CourseProps } from "@/types/course";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    const exists = await getUserLectureById({ lectureCmsId: lectureId });

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
      router.push(`/course/${course._id}`);
    } catch (error) {
      toast.error("Erro ao concluir a aula");
      throw new Error("Error when complete lecture");
    }
  };

  return (
    <div
      className="absolute bottom-0 left-0 w-full cursor-pointer"
      onClick={completeLecture}
    >
      <div className="flex flex-col justify-center items-center bg-primary h-20">
        <p className="font-semibold text-background text-2xl">Concluir</p>
      </div>
    </div>
  );
};

export default CompleteLectureButton;
