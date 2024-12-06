import { client } from "@/sanity/lib/client";
import { QuizProps } from "@/types/quiz";

export const getQuizByLectureId = async ({
  lectureId,
}: {
  lectureId: string;
}) => {
  const query = `
    *[_type == "lecture" && _id == "${lectureId}"][0]{
      quiz -> {
        _id,
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

  return (await client.fetch(query, {})).quiz as QuizProps;
};
