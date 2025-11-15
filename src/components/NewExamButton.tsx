"use client";

import { createExam } from "@/actions/exam/createExam";
import { Exam } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { getExamEligibility } from "@/actions/api/examEligibility";

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
      const eligibilityResult = await getExamEligibility(userId);
      console.log("[NewExamButton] Resultado recebido:", eligibilityResult);

      if (!eligibilityResult?.success) {
        const errorMessage =
          eligibilityResult?.error || "Erro ao verificar elegibilidade";
        console.error("[NewExamButton] Erro:", errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (!eligibilityResult.data?.canTakeExam) {
        toast.error(
          eligibilityResult.data?.message || "Você não possui vidas suficientes"
        );
        return;
      }

      // Criar exame
      const newExam = await createExam({
        data: {
          lectureCMSid: lectureId,
          userId,
        },
      });

      // Redirecionar para a página do exame
      router.push(`/exam/${newExam.id}/${courseId}/${lectureId}`);
    } catch (error) {
      console.error("Erro ao iniciar exame:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao iniciar a prova";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryExam = async () => {
    setLoading(true);
    try {
      // Verificar elegibilidade primeiro
      const eligibilityResult = await getExamEligibility(userId);
      console.log(
        "[NewExamButton] Resultado recebido (retry):",
        eligibilityResult
      );

      if (!eligibilityResult?.success) {
        const errorMessage =
          eligibilityResult?.error || "Erro ao verificar elegibilidade";
        console.error("[NewExamButton] Erro (retry):", errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (!eligibilityResult.data?.canTakeExam) {
        toast.error(
          eligibilityResult.data?.message || "Você não possui vidas suficientes"
        );
        return;
      }

      // Criar novo exame (consome uma vida)
      const newExam = await createExam({
        data: {
          lectureCMSid: lectureId,
          userId,
        },
      });

      // Redirecionar para a página do exame
      router.push(`/exam/${newExam.id}/${courseId}/${lectureId}`);
    } catch (error) {
      console.error("Erro ao repetir exame:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao iniciar a prova";
      toast.error(errorMessage);
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
