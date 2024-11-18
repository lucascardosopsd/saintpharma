export type AnswerProps = {
  answer: string;
  isCorrect: boolean;
};

export type QuestioProps = {
  cover: {
    aseet: {
      url: string;
    };
  };
  question: string;
  answers: AnswerProps[];
};

export type QuizProps = {
  title: string;
  questions: QuestioProps[];
};
