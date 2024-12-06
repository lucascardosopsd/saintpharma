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
      name: "course",
      title: "Course",
      type: "reference",
      to: [{ type: "course" }],
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
    }),
  ],
});
