import { type SchemaTypeDefinition } from "sanity";
import { CourseType } from "./course";
import { questionStep } from "./questionStep";
import { QuizType } from "./quiz";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [CourseType, QuizType, questionStep],
};
