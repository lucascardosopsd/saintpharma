"use client";

import { useEffect, useState } from "react";

interface ExamEligibilityResult {
  canTakeExam: boolean;
  remainingLives: number;
  totalLives: number;
  nextResetTime: Date | null;
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
      const response = await fetch("/api/exams/eligibility", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          "X-User-Id": userId,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar elegibilidade");
      }

      const data: { success: boolean; data: ExamEligibilityResult } =
        await response.json();

      if (data.success) {
        setEligibility(data.data);
      }
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
