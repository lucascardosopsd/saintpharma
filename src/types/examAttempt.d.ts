export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  answers: ExamAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface ExamWithQuestions {
  id: string;
  lectureCMSid: string;
  userId: string;
  complete: boolean;
  reproved: boolean;
  questions: ExamQuestion[];
  totalQuestions: number;
  timeLimit?: number;
  passingScore?: number;
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

export interface ExamAttemptsResponse {
  attempts: ExamAttempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
