import { type SchemaTypeDefinition } from "sanity";
import { CourseType } from "./course";
import { QuestionType } from "./questionStep";
import { QuizType } from "./quiz";
import { LectureType } from "./lecture";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [CourseType, LectureType, QuizType, QuestionType],
};
