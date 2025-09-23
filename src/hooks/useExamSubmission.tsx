"use client";

import { useState } from "react";
import { ExamResult } from "@/types/examAttempt";

interface UseExamSubmissionProps {
  examId: string;
  userId: string;
}

interface UseExamSubmissionReturn {
  submitAnswers: (answers: ExamAnswer[], timeSpent: number) => Promise<ExamResult | null>;
  loading: boolean;
  error: string | null;
}

interface ExamAnswer {
  questionId: string;
  selectedAnswer: string;
}

export const useExamSubmission = ({
  examId,
  userId,
}: UseExamSubmissionProps): UseExamSubmissionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAnswers = async (
    answers: ExamAnswer[],
    timeSpent: number
  ): Promise<ExamResult | null> => {
    if (!examId || !userId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          answers,
          timeSpent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao submeter exame");
      }

      const data: { success: boolean; data: { result: ExamResult } } = await response.json();

      if (data.success) {
        return data.data.result;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitAnswers,
    loading,
    error,
  };
};
