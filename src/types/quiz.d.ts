export type AnswerProps = {
  answer: string;
  isCorrect: boolean;
};

export type QuestionProps = {
  title: string;
  question: string;
  cover?: {
    asset: {
      url: string;
    };
  };
  answers: AnswerProps[];
};

export type QuizProps = {
  _id: string;
  lectureId: string;
  title: string;
  questions: QuestionProps[];
};
