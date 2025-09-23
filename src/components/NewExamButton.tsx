"use client";

import { createExam } from "@/actions/exam/createExam";
import { Exam } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

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
      // Verificar elegibilidade primeiro
      const response = await fetch("/api/exams/eligibility", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          "X-User-Id": userId,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar elegibilidade");
      }

      const eligibilityData = await response.json();

      if (!eligibilityData.success || !eligibilityData.data.canTakeExam) {
        toast.error(
          eligibilityData.data.message || "Você não possui vidas suficientes"
        );
        return;
      }

      const newExam = await createExam({
        data: {
          lectureCMSid: lectureId,
          userId,
        },
      });

      router.push(`/exam/${newExam.id}/${courseId}/${lectureId}`);
    } catch (error) {
      console.error("Erro ao iniciar exame:", error);
      toast.error("Erro ao iniciar a prova");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryExam = async () => {
    setLoading(true);
    try {
      // Verificar elegibilidade primeiro
      const response = await fetch("/api/exams/eligibility", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          "X-User-Id": userId,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar elegibilidade");
      }

      const eligibilityData = await response.json();

      if (!eligibilityData.success || !eligibilityData.data.canTakeExam) {
        toast.error(
          eligibilityData.data.message || "Você não possui vidas suficientes"
        );
        return;
      }

      // Criar novo exame (que já consome uma vida)
      const newExam = await createExam({
        data: {
          lectureCMSid: lectureId,
          userId,
        },
      });

      router.push(`/exam/${newExam.id}/${courseId}/${lectureId}`);
    } catch (error) {
      console.error("Erro ao repetir exame:", error);
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
