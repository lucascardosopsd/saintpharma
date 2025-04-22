"use client";

import { createExam } from "@/actions/exam/createExam";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Exam } from "@prisma/client";
import { createDamage } from "@/actions/damage/createDamage";

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

    handleRetryExam();
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
      await createDamage({ userId });
      router.push(`/exam/${exam?.id!}/${courseId}/${lectureId}`);
    } catch (error) {
      toast.error("Erro ao iniciar a prova");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckExam}
        disabled={loading || !userLifes}
        className="w-full h-20 text-2xl font-semibold"
      >
        {userLifes ? "Questionário" : "Vidas Insuficientes"}
      </Button>
    </div>
  );
};

export default NewExamButton;
