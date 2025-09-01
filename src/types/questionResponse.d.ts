export interface QuestionResponse {
  questions: Question[];
  totalQuestions: number;
  timeLimit?: number; // em minutos
  passingScore: number; // porcentagem mínima para aprovação
}

export interface Question {
  title: string;
  question: string;
  cover?: {
    asset: {
      url: string;
    };
  };
  answers: Answer[];
}

export interface Answer {
  answer: string;
  isCorrect: boolean;
}