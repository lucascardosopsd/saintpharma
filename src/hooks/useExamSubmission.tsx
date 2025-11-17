"use client";

import { useState } from "react";
import { ExamResult } from "@/types/examAttempt";
import { submitExamAnswers } from "@/actions/api/examSubmit";

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
      const result = await submitExamAnswers({
        examId,
        userId,
        answers,
        timeSpent,
      });
      return result;
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
