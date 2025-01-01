"use client";
import { createCertificate } from "@/actions/certification/create";
import { getUserCertificateByCourse } from "@/actions/certification/getUserCertificatesByCourse";
import { revalidateRoute } from "@/actions/revalidateRoute";
import { CourseProps } from "@/types/course";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";

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

        await revalidateRoute({ fullPath: "/" });

        router.push(`/certificate/${newCertificate.id}`);

        return;
      }

      router.push(`/certificate/${existentCertificate.id}`);
    } catch (error) {
      toast.error("Erro ao criar certificado");
      throw new Error("Error when create certificate");
    }
  };

  return (
    <Button
      disabled={!disabled}
      className="absolute left-0 bottom-0 w-full rounded-b-none z-50"
      onClick={() => disabled && handleCreateCertificate()}
    >
      Certificado
    </Button>
  );
};

export default CourseCertificateButton;
