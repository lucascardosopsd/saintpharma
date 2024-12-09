"use client";

import { createUserLecture } from "@/actions/lecture/createUserLecture";
import { CourseProps } from "@/types/course";
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
  const completeLecture = async () => {
    try {
      await createUserLecture({
        data: {
          lectureCmsId: lectureId,
          courseId: course._id,
          userId,
        },
      });
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
