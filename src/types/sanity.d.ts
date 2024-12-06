type LectureContentBlock = {
  _type: "block";
  children?: Array<{
    text: string;
    marks?: string[];
  }>;
};

type LectureContentYouTube = {
  _type: "youtubeUrl";
  url: string;
};

type LectureContentImage = {
  _type: "image";
  imageUrl: string;
  caption?: string;
};

type LectureContent =
  | LectureContentBlock
  | LectureContentYouTube
  | LectureContentImage;

export type SanityLectureProps = {
  _id: string;
  title: string;
  content: LectureContent[];
};

export type GetSanityLecturesResponse = SanityLectureProps[];
