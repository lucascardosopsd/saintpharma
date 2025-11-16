"use client";
import { useState, useCallback } from "react";
import { CourseProps } from "@/types/course";
import { Button } from "./ui/button";
import { Certificate as CertificateType } from "@prisma/client";
import { User } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { toast } from "sonner";

type CertificateButtonProps = {
  course: CourseProps;
  user: User;
  certificate: CertificateType;
};

const Certificate = ({ course, user, certificate }: CertificateButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to sanitize course name for filename
  const sanitizeFileName = (name: string): string => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, "-") // Substitui espaços por hífens
      .toLowerCase()
      .trim();
  };

  // Function to download the certificate as a PDF
  const downloadPDF = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    toast.info("Gerando certificado...");

    try {
      // Fazer requisição para a API route que gera o PDF no servidor
      const response = await fetch(`/api/certificate/${certificate.id}/pdf`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao gerar certificado");
      }

      // Obter o blob do PDF
      const blob = await response.blob();

      // Criar link de download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFileName(course.name)}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Limpar após download
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 200);

      toast.success("Certificado baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error(
        error instanceof Error
          ? `Erro: ${error.message}`
          : "Erro ao gerar o certificado. Tente novamente."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [course, certificate.id, isGenerating]);

  return (
    <div className="relative w-full">
      {/* Área de conteúdo visível */}
      <div className="flex flex-col items-center justify-center py-8 px-4">
        {/* Ícone de certificado */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
        </div>

        {/* Mensagem de sucesso */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          Certificado Pronto!
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          Seu certificado de conclusão do curso{" "}
          <span className="font-semibold text-foreground">{course.name}</span>{" "}
          está pronto para download.
        </p>

        {/* Download Button */}
        <Button
          onClick={downloadPDF}
          disabled={isGenerating}
          size="lg"
          className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Gerando PDF...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Baixar Certificado em PDF
            </>
          )}
        </Button>

        {/* Informações adicionais */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Carga Horária</p>
            <p className="text-lg font-bold text-primary">{course.workload}h</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Data de Conclusão
            </p>
            <p className="text-lg font-bold text-primary">
              {format(new Date(certificate.createdAt), "dd/MM/yyyy")}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pontos Ganhos</p>
            <p className="text-lg font-bold text-primary">{course.points}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
