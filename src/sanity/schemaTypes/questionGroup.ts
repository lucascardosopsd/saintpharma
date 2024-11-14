import { defineArrayMember, defineField, defineType } from "sanity";

export const questionGroupType = defineType({
  name: "questionGroup",
  title: "3. Perguntas",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Pergunta",
      type: "text",
    }),
    defineField({
      name: "answers",
      title: "Respostas",
      type: "array",
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
              type: "boolean",
            },
          ],
        }),
      ],
    }),
  ],
});
