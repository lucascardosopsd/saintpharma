type LectureProps = {
  id: string;
  lectureId: string;
  courseId: string;
};
type UsersProps = {
  id: string;
  name: string;
  lectures: LectureProps[];
};

export const users: UsersProps[] = [
  {
    id: "1",
    name: "Lucas Cardoso",
    lectures: [] as unknown as LectureProps[],
  },
];
