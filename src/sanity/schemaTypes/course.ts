import { defineField, defineType } from "sanity";

export const CourseType = defineType({
  name: "course",
  title: "1. Cursos",
  type: "document",
  fields: [
    defineField({
      name: "banner",
      title: "Capa",
      type: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Nome",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Abreviação",
      type: "slug",
      hidden: true,
      options: {
        source: "title",
        maxLength: 200,
        slugify: (input) =>
          input.toLowerCase().replace(/\s+/g, "-").slice(0, 200),
      },
    }),

    defineField({
      name: "points",
      title: "Pontuação por conclusão",
      type: "number",
      initialValue: 100,
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
      name: "workload",
      title: "Carga horária",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descrição no certificado",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "premiumPoints",
      title: "Pontuação Premium (Opacional)",
      type: "number",
    }),
    defineField({
      name: "quiz",
      title: "Quiz",
      type: "reference",
      validation: (rule) => rule.required(),
      to: [{ type: "quiz" }],
    }),
  ],
});
