"use client";

import { useState } from "react";
import { useExamAttempts } from "@/hooks/useExamAttempts";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, CheckCircle, XCircle, Calendar, Trophy, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExamAttemptsHistoryProps {
  examId: string;
  userId: string;
  onAttemptClick?: (attemptId: string) => void;
}

const ExamAttemptsHistory = ({
  examId,
  userId,
  onAttemptClick,
}: ExamAttemptsHistoryProps) => {
  const { attempts, pagination, loading, error, loadMore, hasMore } = useExamAttempts({
    examId,
    userId,
    limit: 5,
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading && attempts.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Tentativas</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Tentativas</h3>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-red-600">Erro ao carregar histórico: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Tentativas</h3>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">Nenhuma tentativa encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Histórico de Tentativas</h3>
        <Badge variant="outline">{pagination?.total || 0} tentativas</Badge>
      </div>

      <div className="space-y-3">
        {attempts.map((attempt) => (
          <Card
            key={attempt.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              onAttemptClick ? "hover:shadow-md" : ""
            }`}
            onClick={() => onAttemptClick?.(attempt.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {attempt.score >= 70 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {attempt.correctAnswers}/{attempt.totalQuestions} corretas
                  </span>
                </div>
                <Badge variant={getScoreBadgeVariant(attempt.score)}>
                  {attempt.score.toFixed(1)}%
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(attempt.timeSpent)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(attempt.completedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Target className="h-4 w-4" />
                  <span>
                    {attempt.correctAnswers} de {attempt.totalQuestions} questões
                  </span>
                </div>
                {attempt.score >= 80 && (
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <Trophy className="h-4 w-4" />
                    <span>Excelente!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Carregando..." : "Carregar Mais"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamAttemptsHistory;
