export type AnswerProps = {
  options: [
    {
      answer: string;
      isCorrect: Boolean;
    },
  ];
};

export type AnswersProps = {
  answers: AnswerProps[];
};

export type QuestionGroupProps = {
  question: string;
};
