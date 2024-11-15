import { defineField, defineType } from "sanity";

export const QuizType = defineType({
  name: "quiz",
  title: "2. Quizzes",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "questions",
      title: "Perguntas",
      type: "reference",
      validation: (rule) => rule.required(),
      to: [{ type: "questionGroup" }],
    }),
  ],
});
