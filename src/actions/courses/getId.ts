import { client } from "@/sanity/lib/client";
import { CourseProps } from "@/types/course";

export const getCourseById = async ({ id }: { id: string }) => {
  const query = `
    *[_type == "course" && _id == "${id}"][0]{
        _id,
        banner {
          asset -> {
            url
          }
        },
        name,
        slug,
        points,
        content[] {
            _type == "block" => @,
            _type == "youtubeUrl" => @,
            _type == "image" => {
            "_type":"image",
                "imageUrl": asset->url,
                "caption": caption // Inclua a legenda, se necessário
            }
        },
        workload,
        description,
        premiumPoints,
    }
  `;

  return (await client.fetch(query)) as CourseProps;
};
