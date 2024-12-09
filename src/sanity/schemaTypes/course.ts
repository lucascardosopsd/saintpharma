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
      name: "lectures",
      title: "Aulas",
      type: "array",
      of: [
        defineField({
          name: "lecture",
          title: "Aulas",
          type: "reference",
          validation: (rule) => rule.required(),
          to: [{ type: "lecture" }],
        }),
      ],
    }),
  ],
});
