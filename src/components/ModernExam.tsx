"use client";

import { useExamEligibility } from "@/hooks/useExamEligibility";
import { useExamSubmission } from "@/hooks/useExamSubmission";
import { useExamWithQuestions } from "@/hooks/useExamWithQuestions";
import { ExamAttempt } from "@/types/examAttempt";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Heart,
  Timer,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ExamAttemptsHistory from "./ExamAttemptsHistory";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface ModernExamProps {
  examId: string;
  userId: string;
  courseId: string;
  lectureId: string;
  userLifes: number;
}

const ModernExam = ({
  examId,
  userId,
  courseId,
  lectureId,
  userLifes,
}: ModernExamProps) => {
  const router = useRouter();
  const { exam, loading, error, refetch } = useExamWithQuestions({
    examId,
    userId,
  });
  const { submitAnswers, loading: submitting } = useExamSubmission({
    examId,
    userId,
  });
  const { eligibility } = useExamEligibility({ userId });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(
    null
  );

  // Timer effect
  useEffect(() => {
    if (startTime && !showResults) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, showResults]);

  // Start exam when loaded
  useEffect(() => {
    if (exam && !startTime) {
      setStartTime(new Date());
    }
  }, [exam, startTime]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < (exam?.questions.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!exam || !startTime) return;

    const finalTimeSpent = Math.floor(
      (Date.now() - startTime.getTime()) / 1000
    );
    const answersArray = Object.entries(answers).map(
      ([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      })
    );

    try {
      const result = await submitAnswers(answersArray, finalTimeSpent);
      if (result) {
        setExamResult(result);
        setShowResults(true);
        toast.success(result.passed ? "Exame aprovado!" : "Exame reprovado");
      }
    } catch (error) {
      toast.error("Erro ao submeter exame");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (!exam) return 0;
    return ((currentQuestion + 1) / exam.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[92svh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando exame...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="flex items-center justify-center h-[92svh]">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Erro ao carregar exame: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!userLifes || (eligibility && !eligibility.canTakeExam)) {
    return (
      <div className="flex items-center justify-center h-[92svh]">
        <div className="text-center max-w-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-2xl mb-2">Você não possui mais vidas!</p>
          {eligibility?.message && (
            <p className="text-muted-foreground mb-4">{eligibility.message}</p>
          )}
          {eligibility?.nextResetTime && (
            <p className="text-sm text-muted-foreground mb-4">
              Próximo reset: {eligibility.nextResetTime.toLocaleString("pt-BR")}
            </p>
          )}
          <Button
            onClick={() => router.push(`/course/${courseId}`)}
            className="mt-4"
          >
            Voltar ao Curso
          </Button>
        </div>
      </div>
    );
  }

  if (showResults && examResult) {
    return (
      <div className="flex flex-col items-center justify-center h-[92svh] p-5">
        <div className="max-w-md w-full space-y-6">
          {examResult.passed ? (
            <div className="text-center">
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                Aprovado!
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {examResult.correctAnswers}/{examResult.totalQuestions} questões
                corretas
              </p>
              <Badge variant="default" className="text-lg px-4 py-2">
                {examResult.score.toFixed(1)}%
              </Badge>
            </div>
          ) : (
            <div className="text-center">
              <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-red-600 mb-2">
                Reprovado
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {examResult.correctAnswers}/{examResult.totalQuestions} questões
                corretas
              </p>
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {examResult.score.toFixed(1)}%
              </Badge>
            </div>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {formatTime(examResult.timeSpent)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {examResult.correctAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground">Corretas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/course/${courseId}`)}
              className="w-full"
              size="lg"
            >
              Voltar ao Curso
            </Button>
            <Button
              onClick={() => setShowHistory(true)}
              variant="outline"
              className="w-full"
            >
              Ver Histórico de Tentativas
            </Button>
          </div>
        </div>

        <ExamAttemptsHistory
          examId={examId}
          userId={userId}
          onAttemptClick={(attemptId) => {
            // Find the attempt and show details
            // This would need to be implemented with the attempt data
          }}
        />
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestion];
  const isLastQuestion = currentQuestion === exam.questions.length - 1;
  const allAnswered = getAnsweredCount() === exam.questions.length;

  return (
    <div className="flex flex-col h-[92svh]">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/course/${courseId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm">
                  {eligibility?.remainingLives || 0}/
                  {eligibility?.totalLives || 0} vidas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeSpent)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                Questão {currentQuestion + 1} de {exam.questions.length}
              </span>
              <span>
                {getAnsweredCount()}/{exam.questions.length} respondidas
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQ.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{currentQ.question}</p>

              <div className="space-y-2">
                {currentQ.answers.map((answer, index) => (
                  <Button
                    key={index}
                    variant={
                      answers[currentQ.id] === answer.answer
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() =>
                      handleAnswerSelect(currentQ.id, answer.answer)
                    }
                  >
                    <span className="font-medium mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {answer.answer}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t bg-background p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="flex-1"
            >
              {submitting ? "Submetendo..." : "Finalizar Exame"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              Próxima
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernExam;
