import { client } from "@/sanity/lib/client";
import { SanityLectureProps } from "@/types/sanity";

export const getLectureById = async ({ id }: { id: string }) => {
  const query = `
    *[_type == "lecture" && _id == "${id}"][0]{
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

  return (await client.fetch(query)) as SanityLectureProps;
};
