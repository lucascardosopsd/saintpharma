"use client";
import { QuizProps } from "@/types/quiz";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import QuestionForm from "./Question";
import { CircleCheckBig, CircleX } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { minExamPercentage } from "@/constants/exam";
import { CourseProps } from "@/types/course";
import { toast } from "sonner";
import { createUserLecture } from "@/actions/lecture/createUserLecture";
import { useRouter } from "next/navigation";
import { getUserLectureById } from "@/actions/lecture/getUserLectureById";
import { revalidateRoute } from "@/actions/revalidateRoute";
import { updateExam } from "@/actions/exam/updateExam";
import { createDamage } from "@/actions/damage/createDamage";

type ExamProps = {
  quiz: QuizProps;
  course: CourseProps;
  userId: string;
  lectureId: string;
  examId: string;
  userLifes: number;
};

const Exam = ({
  quiz,
  course,
  userId,
  lectureId,
  examId,
  userLifes,
}: ExamProps) => {
  if (!userLifes) {
    return (
      <div className="h-svh w-full flex items-center justify-center">
        <p className="text-2xl">Você não possuí mais vidas!</p>
      </div>
    );
  }

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

  const handleRepeat = async () => {
    try {
      await createDamage({ userId });

      await updateExam({
        id: examId,
        data: {
          reproved: true,
          lectureCMSid: lectureId,
          userId,
        },
      });

      setStep(0);
      setAnswers([]);
    } catch (error) {
      toast.error("Erro ao repetir prova");
    }
  };

  const handleComplete = async () => {
    try {
      await updateExam({
        id: examId,
        data: {
          reproved: false,
          complete: true,
          lectureCMSid: lectureId,
          userId,
        },
      });

      const exists = await getUserLectureById({
        lectureCmsId: lectureId,
        userId,
      });

      if (!exists) {
        await createUserLecture({
          data: {
            lectureCmsId: lectureId,
            courseId: course._id,
            userId,
          },
        });
      }

      // Revalidar de forma não bloqueante
      revalidateRoute({ fullPath: "/" }).catch((error) => {
        console.error("[Exam] Erro ao revalidar (não crítico):", error);
      });

      router.push(`/course/${course._id}`);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao concluir prova");
      throw new Error("Error when finish exam");
    }
  };

  // Step Components
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

        <Button size="lg" onClick={handleComplete}>
          Concluir
        </Button>
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
        <Button size="lg" onClick={handleRepeat} disabled={!userLifes}>
          Repetir
        </Button>
        <p>{userLifes ? " Isso custará 1 vida" : "Você não tem mais vidas."}</p>
      </div>
    ),
  ];

  const modals = [
    quiz.questions.length > 1 && (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-[100svh] max-w-screen">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center h-full w-full">
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
      </Dialog>
    ),
  ];

  useEffect(() => {
    if (step == Math.floor(quiz.questions.length / 2) && steps.length > 1) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [step]);

  const handleNext = () => {
    if (answers[step] !== undefined) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="relative">
      <div className="flex flex-col gap-5 p-5 pb-20 h-[92svh] overflow-y-scroll container max-w-[500px]">
        {steps[step]}

        {modals.map((modal, index) => (
          <span key={index}>{modal}</span>
        ))}
      </div>

      {step <= quiz.questions.length - 1 && (
        <div className="flex gap-2 absolute bottom-0 bg-background w-full p-5">
          <div className="container flex gap-5 max-w-[500px]">
            <Button
              size="lg"
              variant="default"
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
