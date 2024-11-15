import { client } from "@/sanity/lib/client";
import { CourseProps } from "@/types/course";

export const getCourses = async () => {
  const query = `
    *[_type == "course"]{
        _id,
        banner{
          asset -> {
            url
          }
        },
        name,
        slug,
        points,
        content,
        workload,
        description,
    }
    `;

  return (await client.fetch(query)) as CourseProps[];
};
