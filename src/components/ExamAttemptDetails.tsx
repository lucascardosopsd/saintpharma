"use client";

import { useState, useEffect } from "react";
import { ExamAttempt, ExamWithQuestions } from "@/types/examAttempt";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CheckCircle, XCircle, Clock, Calendar, Target, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExamAttemptDetailsProps {
  attempt: ExamAttempt;
  exam: ExamWithQuestions | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExamAttemptDetails = ({
  attempt,
  exam,
  isOpen,
  onClose,
}: ExamAttemptDetailsProps) => {
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

  const getQuestionById = (questionId: string) => {
    return exam?.questions.find(q => q.id === questionId);
  };

  const getAnswerByQuestionId = (questionId: string) => {
    return attempt.answers.find(a => a.questionId === questionId);
  };

  const getCorrectAnswer = (questionId: string) => {
    const question = getQuestionById(questionId);
    return question?.answers.find(a => a.isCorrect);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {attempt.score >= 70 ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            Detalhes da Tentativa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Tentativa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {attempt.score.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Pontuação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {attempt.correctAnswers}/{attempt.totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Corretas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatTime(attempt.timeSpent)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {attempt.score >= 70 ? "Aprovado" : "Reprovado"}
                  </div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Realizado{" "}
                    {formatDistanceToNow(new Date(attempt.completedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Tempo médio por questão: {formatTime(Math.floor(attempt.timeSpent / attempt.totalQuestions))}
                  </span>
                </div>
                {attempt.score >= 80 && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600 font-medium">
                      Excelente desempenho!
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detalhes das Respostas */}
          {exam && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Respostas Detalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exam.questions.map((question, index) => {
                    const userAnswer = getAnswerByQuestionId(question.id);
                    const correctAnswer = getCorrectAnswer(question.id);
                    const isCorrect = userAnswer?.isCorrect || false;

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border ${
                          isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">{question.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {question.question}
                            </p>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium">Sua resposta: </span>
                                <span className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                  {userAnswer?.selectedAnswer || "Não respondida"}
                                </span>
                              </div>
                              {!isCorrect && correctAnswer && (
                                <div>
                                  <span className="text-sm font-medium">Resposta correta: </span>
                                  <span className="text-sm text-green-600">
                                    {correctAnswer.answer}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamAttemptDetails;
