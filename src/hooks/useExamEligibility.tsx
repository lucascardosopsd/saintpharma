"use client";

import { useEffect, useState } from "react";
import { checkExamEligibility } from "@/actions/exam/checkExamEligibility";

interface ExamEligibilityResult {
  canTakeExam: boolean;
  remainingLives: number;
  totalLives: number;
  nextResetTime: string | null; // ISO string format (Next.js 15 serialization)
  message?: string;
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

  const fetchEligibility = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await checkExamEligibility({ userId });
      setEligibility(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchEligibility();
  };

  useEffect(() => {
    fetchEligibility();
  }, [userId]);

  return {
    eligibility,
    loading,
    error,
    refetch,
  };
};
