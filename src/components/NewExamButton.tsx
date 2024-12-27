"use client";

import { createExam } from "@/actions/exam/createExam";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Exam } from "@prisma/client";

type NewExamButtonProps = {
  lectureId: string;
  userId: string;
  courseId: string;
  exam: Exam | null;
  userLifes: number;
};

const NewExamButton = ({
  lectureId,
  courseId,
  userId,
  exam,
  userLifes,
}: NewExamButtonProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckExam = async () => {
    if (!exam || exam.complete) {
      handleNewExam();
      return;
    }

    if (exam && exam.reproved && !exam.complete) {
      handleRetryExam();
      return;
    }
  };

  const handleNewExam = async () => {
    setLoading(true);
    try {
      const newExam = await createExam({
        data: {
          lectureCMSid: lectureId,
          userId,
        },
      });

      router.push(`/exam/${newExam.id}/${courseId}/${lectureId}`);
    } catch (error) {
      toast.error("Erro ao iniciar a prova");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryExam = async () => {
    try {
      router.push(`/exam/${exam?.id!}/${courseId}/${lectureId}`);
    } catch (error) {
      toast.error("Erro ao iniciar a prova");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full rounded-b-none">
      <Button
        onClick={handleCheckExam}
        disabled={loading || !userLifes}
        className="w-full"
      >
        {userLifes ? "Questionário" : "Vidas Insuficientes"}
      </Button>
      {userLifes == 0 ? "" : ""}
    </div>
  );
};

export default NewExamButton;
