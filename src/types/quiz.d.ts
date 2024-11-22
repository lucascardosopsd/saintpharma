export type AnswerProps = {
  answer: string;
  isCorrect: boolean;
};

export type QuestionProps = {
  cover?: {
    asset: {
      url: string;
    };
  };
  question: string;
  answers: AnswerProps[];
  title: string;
};

export type QuizProps = {
  title: string;
  questions: QuestionProps[];
};
