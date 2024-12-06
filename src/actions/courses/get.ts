import { client } from "@/sanity/lib/client";
import { CourseProps } from "@/types/course";

export const getCourses = async () => {
  const query = `
    *[_type == "course"] | order(_createdAt asc){
        _id,
        banner{
          asset -> {
            url
          }
        },
        name,
        slug,
        points,
        workload,
        description,
        premiumPoints,
    }
    `;

  return (await client.fetch(query)) as CourseProps[];
};
