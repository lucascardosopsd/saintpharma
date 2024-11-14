import { defineField, defineType } from "sanity";

export const CourseType = defineType({
  name: "course",
  title: "1. Cursos",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nome",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Abreviação",
      type: "slug",
      hidden: true,
    }),

    defineField({
      name: "points",
      title: "Pontuação por conclusão",
      type: "number",
      initialValue: 100,
    }),

    defineField({
      name: "content",
      title: "Conteúdo do Curso",
      type: "array",
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
          type: "file",
        },
      ],
    }),

    defineField({
      name: "workload",
      title: "Carga horária",
      type: "number",
    }),
    defineField({
      name: "description",
      title: "Descrição no certificado",
      type: "text",
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
      to: [{ type: "quiz" }],
    }),
  ],
});
