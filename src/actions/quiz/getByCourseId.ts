import { client } from "@/sanity/lib/client";
import { QuizProps } from "@/types/quiz";

export const getQuizByCourseId = async ({ id }: { id: string }) => {
  const query = `
    *[_type == "course"&& _id == "${id}"][0]{
      quiz -> {
        title,
        questions[] -> {
            title,
            cover{
              asset -> {
                url
              },
            },
            question,
            "answers": answers[]{
              answer,
              isCorrect,
            },
        },
      },
    }
  `;

  return (await client.fetch(query)) as QuizProps;
};
