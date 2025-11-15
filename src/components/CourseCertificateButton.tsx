"use client";
import { useState } from "react";
import { getUserCertificateByCourse } from "@/actions/certification/getUserCertificatesByCourse";
import { createCertificateForUser } from "@/actions/certification/create";
import { revalidateRoute } from "@/actions/revalidateRoute";
import { CourseProps } from "@/types/course";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCertificate = async () => {
    if (isLoading) return; // Prevenir múltiplos cliques
    
    setIsLoading(true);
    try {
      // Primeiro, verificar se o certificado já existe
      const existingCertificate = await getUserCertificateByCourse({
        courseId: course._id,
        userId,
      });

      console.log("[CourseCertificateButton] Verificação inicial:", {
        hasCertificate: !!existingCertificate,
        hasId: !!existingCertificate?.id,
        certificateId: existingCertificate?.id,
      });

      if (existingCertificate && existingCertificate.id) {
        // Se já existe, redirecionar diretamente
        console.log("[CourseCertificateButton] Certificado já existe, redirecionando:", existingCertificate.id);
        router.push(`/certificate/${existingCertificate.id}`);
        return;
      }

      // Se não existe, criar um novo usando a action
      console.log("[CourseCertificateButton] Certificado não encontrado, criando via action...");
      
      const certificate = await createCertificateForUser({ course });

      console.log("[CourseCertificateButton] Resultado da action:", {
        hasCertificate: !!certificate,
        hasId: !!certificate?.id,
        certificateId: certificate?.id,
      });

      // Validar que o certificado foi retornado corretamente
      if (!certificate || !certificate?.id) {
        throw new Error("Erro ao criar certificado. Tente novamente.");
      }

      // Revalidar de forma não bloqueante
      revalidateRoute({ fullPath: "/" }).catch((error) => {
        console.error("[CourseCertificateButton] Erro ao revalidar (não crítico):", error);
      });
      router.push(`/certificate/${certificate.id}`);
    } catch (error) {
      console.error("[CourseCertificateButton] Erro ao criar certificado:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar certificado"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      disabled={!disabled || isLoading}
      className="w-full text-2xl font-semibold text-background h-20"
      onClick={() => disabled && !isLoading && handleCreateCertificate()}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin" />
          Processando...
        </>
      ) : (
        "Certificado"
      )}
    </Button>
  );
};

export default CourseCertificateButton;
