import { client } from "@/sanity/lib/client";
import { GetSanityLecturesResponse } from "@/types/sanity";

export const getLectures = async () => {
  const query = `
    *[_type == "lecture" | order(_createdAt asc)]{
        _id,
        title,
        course->{
          _id,
        },
        content[] {
            _type == "block" => @,
            _type == "youtubeUrl" => @,
            _type == "image" => {
            "_type":"image",
                "imageUrl": asset->url,
                "caption": caption,
            }
        },
    }
    `;

  return (await client.fetch(query)) as GetSanityLecturesResponse;
};
