import { QuestionProps } from "@/types/quiz";
import Image from "next/image";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

type questionForm = {
  question: QuestionProps;
  questionIndex: number;
  onAnswer: (option: string) => void;
  initialValue?: string;
  steps: number;
};

const QuestionForm = ({
  question,
  questionIndex,
  onAnswer,
  initialValue,
  steps,
}: questionForm) => {
  const coverUrl = question.cover?.asset.url;
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    initialValue
  );

  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onAnswer(value);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-2xl text-primary font-semibold">
          Pergunta {questionIndex + 1} de {steps}
        </p>
        {coverUrl && (
          <Image
            src={coverUrl}
            alt="Capa do questionário"
            height={1000}
            width={1000}
            className="w-full h-[300px] object-cover rounded"
            priority
          />
        )}
        <p>{question.question}</p>
        <div className="flex flex-col gap-5">
          <RadioGroup
            onValueChange={handleValueChange}
            value={selectedValue}
          >
            {question.answers.map((answer, index) => {
              const isSelected = selectedValue === String(index);
              return (
                <Label
                  key={index}
                  htmlFor={String(index)}
                  className={`p-5 border rounded transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-primary"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value={String(index)} id={String(index)} className="mt-1 flex-shrink-0" />
                    <p className="break-words whitespace-normal">{answer.answer}</p>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </>
  );
};

export default QuestionForm;
