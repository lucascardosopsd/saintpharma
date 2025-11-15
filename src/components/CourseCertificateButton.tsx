"use client";
import { useState } from "react";
import { getUserCertificateByCourse } from "@/actions/certification/getUserCertificatesByCourse";
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

      // Se não existe, criar um novo via API route
      console.log("[CourseCertificateButton] Certificado não encontrado, chamando API...");
      
      // Next.js 15: fetch não é mais cacheado por padrão
      // Para POST requests, explicitamente definimos no-store
      const response = await fetch("/api/certificate/for-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course }),
        cache: 'no-store', // Explícito para Next.js 15
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erro ${response.status}: ${response.statusText}`
        );
      }

      const apiResponse = await response.json();
      
      // successResponse retorna { success: true, data: { certificate }, timestamp }
      const certificate = apiResponse.data?.certificate || apiResponse.certificate;

      console.log("[CourseCertificateButton] Resultado da API:", {
        hasCertificate: !!certificate,
        hasId: !!certificate?.id,
        certificateId: certificate?.id,
        fullResponse: apiResponse,
      });

      // Validar que o certificado foi retornado corretamente
      if (!certificate || !certificate?.id) {
        // Fallback: tentar buscar novamente
        console.log("[CourseCertificateButton] API retornou certificado inválido, buscando diretamente...");
        
        const newCertificate = await getUserCertificateByCourse({
          courseId: course._id,
          userId,
        });

        console.log("[CourseCertificateButton] Resultado após busca:", {
          hasCertificate: !!newCertificate,
          hasId: !!newCertificate?.id,
          certificateId: newCertificate?.id,
        });

        if (newCertificate && newCertificate.id) {
          await revalidateRoute({ fullPath: "/" });
          router.push(`/certificate/${newCertificate.id}`);
          return;
        }

        throw new Error("Erro ao criar certificado. Tente novamente.");
      }

      await revalidateRoute({ fullPath: "/" });
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
