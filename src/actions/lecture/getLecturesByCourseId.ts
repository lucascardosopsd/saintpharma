import { client } from "@/sanity/lib/client";
import { GetSanityLecturesResponse } from "@/types/sanity";

export const getLecturesByCourseId = async ({
  courseId,
}: {
  courseId: string;
}) => {
  const query = `
    *[_type == "course" && _id == $courseId].lectures->{
      _id,
      title,
      content[] {
        _type == "block" => @,
        _type == "youtubeUrl" => @,
        _type == "image" => {
          "_type": "image",
          "imageUrl": asset->url,
          "caption": caption
        }
      }
    }
  `;

  return (await client.fetch(query, { courseId })) as GetSanityLecturesResponse;
};
