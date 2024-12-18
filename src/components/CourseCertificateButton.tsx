"use client";

import { createCertificate } from "@/actions/certification/create";
import { getUserCertificateByCourse } from "@/actions/certification/getUserCertificatesByCourse";
import { revalidateRoute } from "@/actions/revalidateRoute";
import { cn } from "@/lib/utils";
import { CourseProps } from "@/types/course";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CourseCertificateButtonProps = {
  course: CourseProps;
  userId: string;
  disabled: boolean;
};

const CourseCertificateButton = ({
  course,
  userId,
  disabled,
}: CourseCertificateButtonProps) => {
  const router = useRouter();

  const handleCreateCertificate = async () => {
    try {
      const existentCertificate = await getUserCertificateByCourse({
        courseId: course._id,
        userId,
      });

      if (!existentCertificate) {
        const newCertificate = await createCertificate({
          course,
          userId,
        });

        router.push(`/certificate/${newCertificate.id}`);

        revalidateRoute({ fullPath: "/" });
        return;
      }

      router.push(`/certificate/${existentCertificate.id}`);
    } catch (error) {
      toast.error("Erro ao criar certificado");
      throw new Error("Error when create certificate");
    }
  };

  return (
    <div
      className={cn(
        "h-20 w-full max-w-[800px] rounded-t-lg mx-auto absolute bottom-0 left-0 right-0 bg-primary text-background text-2xl flex items-center justify-center font-semibold cursor-pointer",
        !disabled && "bg-primary/50 cursor-default"
      )}
      onClick={() => disabled && handleCreateCertificate()}
    >
      Certificado
    </div>
  );
};

export default CourseCertificateButton;
