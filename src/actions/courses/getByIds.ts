"use server";
import { client } from "@/sanity/lib/client";
import { CourseProps } from "@/types/course";

export const getCoursesByIds = async ({ ids }: { ids: string[] }) => {
  if (ids.length === 0) {
    return [];
  }

  const query = `
    *[_type == "course" && _id in $ids]{
        _id,
        banner {
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

  return (await client.fetch(query, { ids })) as CourseProps[];
};

