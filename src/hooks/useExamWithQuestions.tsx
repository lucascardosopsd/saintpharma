"use client";

import { useState, useEffect, useCallback } from "react";
import { ExamWithQuestions } from "@/types/examAttempt";
import { getExamWithQuestions } from "@/actions/api/examQuestions";

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

  const fetchExam = useCallback(async () => {
    if (!examId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const examData = await getExamWithQuestions(examId, userId);
      setExam(examData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [examId, userId]);

  const refetch = useCallback(async () => {
    await fetchExam();
  }, [fetchExam]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  return {
    exam,
    loading,
    error,
    refetch,
  };
};
