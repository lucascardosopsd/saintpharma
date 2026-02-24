import { defineField, defineType } from "sanity";

export const LectureType = defineType({
  name: "lecture",
  title: "2. Aulas",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "Conteúdo do Curso",
      type: "array",
      validation: (rule) => rule.required(),
      of: [
        {
          type: "block",
          options: {
            spellcheck: false,
          },
        },
        {
          type: "image",
        },

        {
          type: "object",
          name: "youtubeUrl",
          title: "Vídeo do youtube",
          fields: [
            {
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) =>
                Rule.uri({
                  scheme: ["https"],
                  // @ts-ignore
                }).regex(
                  /^(https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11})$/,
                  {
                    name: "youtube",
                    message: "Por favor, insira um link válido do YouTube.",
                  }
                ),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "quiz",
      title: "Quiz",
      type: "reference",
      to: [{ type: "quiz" }],
      options: {
        filter: ({ document }) => {
          const currentId = document?._id?.replace(/^drafts\./, "");

          return {
            filter: `!(_id in *[
              _type == "lecture" &&
              defined(quiz._ref) &&
              _id != $draftId &&
              _id != $publishedId
            ].quiz._ref)`,
            params: {
              draftId: currentId ? `drafts.${currentId}` : "",
              publishedId: currentId ?? "",
            },
          };
        },
      },
      validation: (rule) =>
        rule.custom(async (quizRef, context) => {
          if (!quizRef?._ref) return true;

          const client = context.getClient({ apiVersion: "2024-01-01" });
          const currentId = context.document?._id?.replace(/^drafts\./, "");

          const lectureUsingQuiz = await client.fetch(
            `*[
              _type == "lecture" &&
              quiz._ref == $quizId &&
              _id != $draftId &&
              _id != $publishedId
            ][0]{ _id, title }`,
            {
              quizId: quizRef._ref,
              draftId: currentId ? `drafts.${currentId}` : "",
              publishedId: currentId ?? "",
            }
          );

          if (lectureUsingQuiz) {
            return `Este quiz já está vinculado à aula "${lectureUsingQuiz.title}".`;
          }

          return true;
        }),
    }),
  ],
});
