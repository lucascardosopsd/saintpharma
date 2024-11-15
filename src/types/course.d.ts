import { QuizProps } from "./quiz";

export type CourseProps = {
  _id: string;
  banner: {
    asset: {
      url: string;
    };
  };
  name: string;
  slug: string;
  points: number;
  content: TypedObject | TypedObject[];
  workload: number;
  description: string;
  premiumPoints: number;
};

export type FullCourseProps = CourseProps & {
  quiz: QuizProps;
};
