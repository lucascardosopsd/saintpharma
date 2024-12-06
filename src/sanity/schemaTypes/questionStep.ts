import { defineArrayMember, defineField, defineType } from "sanity";

export const QuestionType = defineType({
  name: "questionStep",
  title: "4. Pergunta",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cover",
      title: "Capa",
      type: "image",
    }),
    defineField({
      name: "question",
      title: "Pergunta",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answers",
      title: "Respostas",
      type: "array",
      validation: (rule) => rule.required(),
      of: [
        defineArrayMember({
          name: "options",
          title: "Opções",
          type: "object",
          fields: [
            {
              title: "Resposta",
              name: "answer",
              type: "string",
            },
            {
              title: "Marcar como correta",
              name: "isCorrect",
              initialValue: false,
              type: "boolean",
            },
          ],
        }),
      ],
    }),
  ],
});
