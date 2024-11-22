"use client";
import { QuizProps } from "@/types/quiz";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import QuestionForm from "./Question";
import { CircleCheckBig, CircleX } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { minExamPercentage, pointsAward } from "@/constants/exam";

type ExamProps = {
  quiz: QuizProps;
};

const Exam = ({ quiz }: ExamProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([] as number[]);
  const [points, setPoints] = useState([0] as number[]);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleNewAnswer = (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[step] = Number(answer);
    setAnswers(updatedAnswers);

    const updatedPoints = [...points];
    if (quiz.questions[step].answers[Number(answer)].isCorrect) {
      updatedPoints[step] = 1;
    } else {
      updatedPoints[step] = 0;
    }
    setPoints(updatedPoints);
  };

  const finalPoints = points.reduce((prev, current) => prev + current, 0);

  const steps = [
    ...quiz.questions.map((question, index) => (
      <QuestionForm
        key={`question-form-${index}`}
        question={question}
        questionIndex={index}
        steps={quiz.questions.length}
        onAnswer={handleNewAnswer}
        initialValue={String(answers[step])}
      />
    )),

    finalPoints >= Math.ceil(quiz.questions.length * minExamPercentage) ? (
      <div
        key="result-passed"
        className="flex flex-col items-center justify-center h-[92svh]"
      >
        <CircleCheckBig size={200} className="text-green-500" />
        <p className="text-2xl font-semibold">Aprovado!</p>
        <p className="text-muted-foreground">
          {finalPoints}/{quiz.questions.length}
        </p>
        <Button size="lg">Certificado</Button>
        <p className="text-muted-foreground flex gap-1">
          Você recebeu
          <span className="text-foreground font-semibold">
            {pointsAward} Pts
          </span>
        </p>
      </div>
    ) : (
      <div
        key="result-failed"
        className="flex flex-col items-center justify-center h-[92svh]"
      >
        <CircleX size={200} className="text-red-500" />
        <p className="text-2xl font-semibold">Reprovado!</p>
        <p className="text-muted-foreground">
          {finalPoints}/{quiz.questions.length}
        </p>
        <Button size="lg" onClick={() => router.refresh()}>
          Repetir
        </Button>
      </div>
    ),
  ];

  useEffect(() => {
    if (step == Math.floor(quiz.questions.length / 2)) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [step]);

  const modals = [
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[100svh]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center h-full 0">
          <div className="mb-10 text-center my-auto">
            <p className="text-6xl text-primary font-semibold">Parabéns!</p>
            <p className="font-semibold text-2xl">
              Você concluiu 50% do teste!
            </p>
          </div>
          <Image
            alt="Concluiu 50%"
            src="/happy-news.png"
            height={1000}
            width={1000}
            className="h-[400px] w-auto mt-auto"
          />
        </div>
      </DialogContent>
    </Dialog>,
  ];

  const handleNext = () =>
    answers[step] !== undefined &&
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="relative">
      <div className="flex flex-col gap-5 p-5 pb-20 h-[92svh] overflow-y-scroll container max-w-[500px]">
        {steps[step]}

        {modals}
      </div>

      {step <= quiz.questions.length - 1 && (
        <div className="flex gap-2 absolute bottom-0 bg-background w-full p-5">
          <div className="container flex gap-5 max-w-[500px]">
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handlePrev}
              disabled={step === 0}
            >
              Anterior
            </Button>
            <Button
              size="lg"
              className="w-full"
              onClick={handleNext}
              disabled={step === steps.length - 1}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;
