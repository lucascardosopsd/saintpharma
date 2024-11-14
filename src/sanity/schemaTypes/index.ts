import { type SchemaTypeDefinition } from "sanity";
import { CourseType } from "./course";
import { questionGroupType } from "./questionGroup";
import { QuizType } from "./quiz";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [CourseType, QuizType, questionGroupType],
};
