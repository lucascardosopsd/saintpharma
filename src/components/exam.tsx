"use client";

import { QuizProps } from "@/types/quiz";
import { useState } from "react";

type ExamProps = {
  quiz: QuizProps;
};

const Exam = ({ quiz }: ExamProps) => {
  const [step, setStep] = useState();

  console.log(quiz);

  return <div className="flex flex-col gap-5"></div>;
};

export default Exam;
