"use client";

import { createExam } from "@/actions/exam/createExam";
import { checkExamEligibility } from "@/actions/exam/checkExamEligibility";
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
    console.log("[NewExamButton] handleNewExam INICIADO");
    setLoading(true);
    try {
      console.log(
        "[NewExamButton] Verificando elegibilidade com userId:",
        userId
      );
      // Verificar elegibilidade primeiro usando a action
      const eligibility = await checkExamEligibility({ userId });
      console.log(
        "[NewExamButton] Elegibilidade verificada com sucesso:",
        eligibility
      );

      if (!eligibility.canTakeExam) {
        toast.error(eligibility.message || "Você não possui vidas suficientes");
        setLoading(false);
        return;
      }

      console.log("[NewExamButton] Criando exame com:", {
        lectureCMSid: lectureId,
        userId,
      });
      const newExam = await createExam({
        data: {
          lectureCMSid: lectureId,
          userId,
        },
      });
      console.log("[NewExamButton] Exame criado com sucesso:", newExam);
      console.log(
        "[NewExamButton] Redirecionando para:",
        `/exam/${newExam.id}/${courseId}/${lectureId}`
      );

      router.push(`/exam/${newExam.id}/${courseId}/${lectureId}`);
    } catch (error) {
      console.error("Erro ao iniciar exame:", error);
      console.error("Detalhes do erro:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Mostrar mensagem de erro específica se disponível
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
      // Verificar elegibilidade primeiro usando a action
      const eligibility = await checkExamEligibility({ userId });

      if (!eligibility.canTakeExam) {
        toast.error(eligibility.message || "Você não possui vidas suficientes");
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
      console.error("Detalhes do erro:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Mostrar mensagem de erro específica se disponível
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
