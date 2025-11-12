"use server";

import { getLecturesByCourseId } from "@/actions/lecture/getLecturesByCourseId";
import { getUserLectures } from "@/actions/lecture/getUserLectures";
import { getUserCertificateByCourse } from "@/actions/certification/getUserCertificatesByCourse";
import { CourseProps } from "@/types/course";

export type CourseProgress = {
  courseId: string;
  progressPercentage: number;
  completedCount: number;
  totalLectures: number;
  isCompleted: boolean;
};

/**
 * Busca o progresso de múltiplos cursos para um usuário
 */
export const getCoursesProgress = async ({
  courses,
  userId,
}: {
  courses: CourseProps[];
  userId: string;
}): Promise<Record<string, CourseProgress>> => {
  try {
    // Buscar todas as lectures do usuário de uma vez
    const userLectures = await getUserLectures({ userId });

    // Processar cada curso em paralelo
    const progressPromises = courses.map(async (course) => {
      const courseId = course._id;

      // Buscar lectures e certificado em paralelo
      const [lectures, certificate] = await Promise.all([
        getLecturesByCourseId({ courseId }),
        getUserCertificateByCourse({ courseId, userId }),
      ]);

      // Filtrar lectures completadas pelo usuário neste curso
      const completedLectures = userLectures.filter(
        (ul) => ul.courseId === courseId
      );
      const completedLectureIds = new Set(
        completedLectures.map((ul) => ul.lectureCmsId)
      );

      // Calcular progresso
      const totalLectures = lectures.length;
      const completedCount = lectures.filter((lecture) =>
        completedLectureIds.has(lecture._id)
      ).length;
      const progressPercentage =
        totalLectures > 0
          ? Math.round((completedCount / totalLectures) * 100)
          : 0;

      const isCompleted = !!certificate;

      return {
        courseId,
        progress: {
          courseId,
          progressPercentage,
          completedCount,
          totalLectures,
          isCompleted,
        },
      };
    });

    const results = await Promise.all(progressPromises);

    // Converter array em objeto indexado por courseId
    const progressMap: Record<string, CourseProgress> = {};
    results.forEach(({ courseId, progress }) => {
      progressMap[courseId] = progress;
    });

    return progressMap;
  } catch (error) {
    console.error("Erro ao buscar progresso dos cursos:", error);
    return {};
  }
};







