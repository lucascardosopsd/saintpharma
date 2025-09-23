"use client";

import { useState, useEffect } from "react";
import { ExamAttemptsResponse, ExamAttempt } from "@/types/examAttempt";

interface UseExamAttemptsProps {
  examId: string;
  userId: string;
  page?: number;
  limit?: number;
}

interface UseExamAttemptsReturn {
  attempts: ExamAttempt[];
  pagination: ExamAttemptsResponse["pagination"] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useExamAttempts = ({
  examId,
  userId,
  page = 0,
  limit = 10,
}: UseExamAttemptsProps): UseExamAttemptsReturn => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [pagination, setPagination] = useState<ExamAttemptsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchAttempts = async (pageNum: number, append = false) => {
    if (!examId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/exams/${examId}/attempts?page=${pageNum}&limit=${limit}`,
        {
          headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            "X-User-Id": userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar tentativas do exame");
      }

      const data: { success: boolean; data: ExamAttemptsResponse } = await response.json();

      if (data.success) {
        if (append) {
          setAttempts(prev => [...prev, ...data.data.attempts]);
        } else {
          setAttempts(data.data.attempts);
        }
        setPagination(data.data.pagination);
        setCurrentPage(pageNum);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchAttempts(0, false);
  };

  const loadMore = async () => {
    if (pagination?.hasNext && !loading) {
      await fetchAttempts(currentPage + 1, true);
    }
  };

  useEffect(() => {
    fetchAttempts(page, false);
  }, [examId, userId, page, limit]);

  return {
    attempts,
    pagination,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: pagination?.hasNext || false,
  };
};
