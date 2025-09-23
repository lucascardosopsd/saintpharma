"use client";

import { useState, useEffect } from "react";
import { ExamWithQuestions } from "@/types/examAttempt";

interface UseExamWithQuestionsProps {
  examId: string;
  userId: string;
}

interface UseExamWithQuestionsReturn {
  exam: ExamWithQuestions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useExamWithQuestions = ({
  examId,
  userId,
}: UseExamWithQuestionsProps): UseExamWithQuestionsReturn => {
  const [exam, setExam] = useState<ExamWithQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExam = async () => {
    if (!examId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/exams/${examId}/questions`, {
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          "X-User-Id": userId,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar exame com perguntas");
      }

      const data: { success: boolean; data: { exam: ExamWithQuestions } } = await response.json();

      if (data.success) {
        setExam(data.data.exam);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchExam();
  };

  useEffect(() => {
    fetchExam();
  }, [examId, userId]);

  return {
    exam,
    loading,
    error,
    refetch,
  };
};
