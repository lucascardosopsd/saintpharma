"use client";

import { useState, useEffect, useCallback } from "react";
import { ExamAttemptsResponse, ExamAttempt } from "@/types/examAttempt";
import { getExamAttempts } from "@/actions/api/examAttempts";

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

  const fetchAttempts = useCallback(async (pageNum: number, append = false) => {
    if (!examId || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getExamAttempts({ 
        examId, 
        userId, 
        page: pageNum, 
        limit 
      });

      if (append) {
        setAttempts(prev => [...prev, ...data.attempts]);
      } else {
        setAttempts(data.attempts);
      }
      setPagination(data.pagination);
      setCurrentPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [examId, userId, limit]);

  const refetch = useCallback(async () => {
    await fetchAttempts(0, false);
  }, [fetchAttempts]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNext && !loading) {
      await fetchAttempts(currentPage + 1, true);
    }
  }, [pagination?.hasNext, loading, currentPage, fetchAttempts]);

  useEffect(() => {
    fetchAttempts(page, false);
  }, [fetchAttempts, page]);

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
