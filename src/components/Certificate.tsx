"use client";
import { useEffect, useState } from "react";
import { CourseProps } from "@/types/course";
import { Button } from "./ui/button";
import { Certificate as CertificateType } from "@prisma/client";
import { User } from "@clerk/nextjs/server";
import html2canvas from "html2canvas";
import { Star } from "lucide-react";
import { Separator } from "./ui/separator";
import { format } from "date-fns";
import { Sacramento } from "next/font/google";
import { cn } from "@/lib/utils";
import jspdf from "jspdf";
import { toast } from "sonner";
import Image from "next/image";

type CertificateButtonProps = {
  course: CourseProps;
  user: User;
  certificate: CertificateType;
};

const sacramento = Sacramento({
  weight: ["400"],
  subsets: ["latin"],
});

const Certificate = ({ course, user, certificate }: CertificateButtonProps) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  // Function to capture and generate the certificate image
  const generateImage = async () => {
    const element = document.getElementById("certificate");

    if (!element) return;

    if (count < 1) setCount(count + 1);

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
      });

      const imgData = canvas.toDataURL("image/png");
      setImageData(imgData);

      // Hide the original certificate content
      element.style.display = "none";
    } catch (error) {
      toast.error("Erro ao gerar a imagem do certificado");
      console.error(error);
    }
  };

  // Automatically generate the certificate image on page load
  useEffect(() => {
    generateImage();
  }, [count]);

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
  const downloadPDF = async () => {
    if (!imageData) {
      toast.error("Erro: a imagem do certificado não foi gerada");
      return;
    }

    const pdf = new jspdf({
      orientation: "landscape",
      unit: "px",
      format: "a4",
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imageData, "PNG", 0, 0, width, height);

    // Usar o nome do curso sanitizado como nome do arquivo
    const fileName = sanitizeFileName(course.name);
    pdf.save(`${fileName}.pdf`);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Render the original certificate (hidden after image generation) */}
        <div
          className="flex items-center absolute opacity-100 w-[842px] h-[595px] max-w-full"
          id="certificate"
        >
          <div className="flex flex-col justify-between items-center p-6 m-4 border-2 border-primary border-b-0 bg-white shadow-lg h-full w-full box-border">
            {/* Top Section */}
            <div className="flex flex-col items-center w-full flex-shrink-0" style={{ minHeight: 'auto' }}>
              {/* Header - Platform Info */}
              <div className="w-full text-center mb-1">
                <p className="text-primary text-[10px] font-medium">
                  <span className="font-bold">Plataforma EAD:</span>{" "}
                  www.saintpharmacursos.com.br
                </p>
              </div>

              {/* Logo Background */}
              <img
                src="/logo.png"
                alt="Logo"
                height={1000}
                width={1000}
                className="h-full max-h-[250px] w-auto absolute -z-10 opacity-8 object-contain"
              />

              {/* Stars */}
              <div className="flex gap-2 my-0.5">
                {[...new Array(5)].map((_, index) => (
                  <Star
                    className="fill-primary text-primary"
                    size={18}
                    key={index}
                  />
                ))}
              </div>

              {/* Title Section */}
              <div className="flex flex-col items-center gap-0.5 my-1">
                <p className="text-5xl font-bold uppercase text-primary tracking-tight leading-tight">
                  certificado
                </p>
                <p className="text-lg uppercase text-foreground/70 font-normal">
                  De conclusão SaintPharma cursos
                </p>
              </div>

              {/* Course Name Badge */}
              <div className="my-2 px-6 py-2 bg-primary/10 rounded-lg border border-primary/20 flex flex-col items-center justify-center">
                <p className="text-xl font-bold text-primary text-center leading-tight">
                  {course.name}
                </p>
                <p className="text-xs text-primary/60 text-center mt-0.5 font-normal">
                  ({course.workload} Horas)
                </p>
              </div>

              {/* Student Name */}
              <div className="my-2 flex flex-col items-center">
                <div
                  className={cn(
                    "text-5xl flex gap-2 justify-center text-primary leading-tight",
                    sacramento.className
                  )}
                >
                  <span className="font-normal">{user?.firstName}</span>
                  <span className="font-normal">{user?.lastName}</span>
                </div>
              </div>
            </div>

            {/* Middle Section - Flexible */}
            <div className="flex flex-col items-center justify-center flex-1 w-full min-h-0 py-1">
              {/* Description */}
              <div className="text-foreground flex flex-col items-center justify-center text-xs max-w-xl px-4 mb-2">
                <p className="text-center leading-relaxed">
                  A Farmavig cursos afirma por meio deste documento, que o(a)
                  respectivo(a) aluno(a) concluiu com êxito esta formação
                  profissionalizante em nossa plataforma EAD.
                </p>
              </div>

              {/* Conclusion Date Badge */}
              <div className="px-5 py-2 bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center">
                <p className="text-center text-xs">
                  <span className="font-semibold text-foreground">Período de conclusão: </span>
                  <span className="text-foreground">
                    {format(new Date(certificate!.createdAt), "dd/MM/yyyy")}
                  </span>
                </p>
              </div>
            </div>

            {/* Footer - Bottom Section */}
            <div className="flex justify-between items-start gap-6 w-full flex-shrink-0 px-4 mt-1" style={{ minHeight: 'auto' }}>
              <div className="flex flex-col flex-[2] text-left">
                <p className="font-bold text-xs text-foreground mb-1">
                  Conteúdo da formação
                </p>
                <p className="text-[10px] text-foreground/70 leading-relaxed">
                  {certificate!.description}
                </p>
              </div>

              <div className="flex flex-col flex-1 text-primary text-xs justify-center items-center min-w-[180px]">
                <img
                  src="/assinatura_elaine.png"
                  alt="Assinatura"
                  className="h-14 w-auto mx-auto mb-0.5 object-contain"
                />
                <Separator className="w-full my-1 bg-primary/20 h-[1px]" />
                <p className={cn("font-normal text-center text-xs text-primary leading-tight", sacramento.className)}>
                  Elaine Cristina Wandeur da Costa
                </p>
                <p className="text-center text-[10px] mt-0.5 text-foreground/60">Mestre em ensino e saúde</p>
              </div>
            </div>
          </div>
        </div>

        {/* Render the generated certificate image */}
        {imageData && (
          <div className="relative w-full flex justify-center">
            <div className="relative w-full max-w-[842px]">
              <Image
                height={595}
                width={842}
                src={imageData}
                alt="Certificado"
                className="w-full h-auto rounded-lg shadow-2xl border-2 border-primary/20"
                priority
                style={{ aspectRatio: '842/595' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Download Button */}
      {imageData && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => downloadPDF()}
            size="lg"
            className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
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
          </Button>
        </div>
      )}
    </div>
  );
};

export default Certificate;
