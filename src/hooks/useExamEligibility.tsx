"use client";

import { useEffect, useState, useCallback } from "react";
import { getExamEligibility } from "@/actions/api/examEligibility";

interface ExamEligibilityResult {
  canTakeExam: boolean;
  remainingLives: number;
  totalLives: number;
  nextResetTime: string | null; // ISO string após serialização
  message: string | null;
}

interface UseExamEligibilityProps {
  userId: string;
}

interface UseExamEligibilityReturn {
  eligibility: ExamEligibilityResult | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useExamEligibility = ({
  userId,
}: UseExamEligibilityProps): UseExamEligibilityReturn => {
  const [eligibility, setEligibility] = useState<ExamEligibilityResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEligibility = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { getExamEligibility } = await import(
        "@/actions/api/examEligibility"
      );
      const result = await getExamEligibility(userId);

      if (result && result.success && result.data) {
        setEligibility(result.data);
      } else {
        const errorMessage = result?.error || "Erro ao verificar elegibilidade";
        setError(errorMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(async () => {
    await fetchEligibility();
  }, [fetchEligibility]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  return {
    eligibility,
    loading,
    error,
    refetch,
  };
};
