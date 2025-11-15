"use server";
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
        workload,
        description,
        premiumPoints,
    }
  `;

  return (await client.fetch(query)) as CourseProps;
};
