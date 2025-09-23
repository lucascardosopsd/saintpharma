export interface ExamAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // em segundos
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  answers: ExamAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // tempo total em segundos
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamQuestion {
  id: string;
  title: string;
  question: string;
  cover?: {
    asset: {
      url: string;
    };
  };
  answers: {
    answer: string;
    isCorrect: boolean;
  }[];
  order: number;
}

export interface ExamWithQuestions {
  id: string;
  lectureCMSid: string;
  userId: string;
  complete: boolean;
  reproved: boolean;
  questions: ExamQuestion[];
  totalQuestions: number;
  timeLimit?: number; // em minutos
  passingScore?: number; // porcentagem mínima para aprovação
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExamRequest {
  lectureCMSid: string;
  timeLimit?: number;
  passingScore?: number;
}

export interface SubmitExamRequest {
  answers: {
    questionId: string;
    selectedAnswer: string;
  }[];
  timeSpent: number;
}

export interface ExamResult {
  examId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  timeSpent: number;
  answers: ExamAnswer[];
  completedAt: Date;
}
