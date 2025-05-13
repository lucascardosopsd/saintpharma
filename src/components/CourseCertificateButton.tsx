"use client";
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
        const response = await fetch("/api/certificate/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, course }),
        });

        if (!response.ok) {
          throw new Error("Erro ao criar certificado");
        }

        const data = await response.json();
        const certificate = data.certificate;

        console.log(certificate);

        await revalidateRoute({ fullPath: "/" });

        router.push(`/certificate/${certificate.id}`);

        return;
      }

      console.log(existentCertificate);

      router.push(`/certificate/${existentCertificate.id}`);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar certificado");
      throw new Error("Error when create certificate");
    }
  };

  return (
    <Button
      disabled={!disabled}
      className="w-full text-2xl font-semibold text-background h-20"
      onClick={() => disabled && handleCreateCertificate()}
    >
      Certificado
    </Button>
  );
};

export default CourseCertificateButton;
