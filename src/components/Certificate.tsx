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

    pdf.save("certificado.pdf");
  };

  return (
    <>
      <div className="relative">
        {/* Render the original certificate (hidden after image generation) */}
        <div
          className="flex items-center absolute opacity-100 w-[842px] h-[595px]"
          id="certificate"
        >
          <div className="flex flex-col gap-2 items-center justify-center p-2 m-5 border border-primary border-b-0">
            <p className="text-primary">
              <span className="font-bold">Plataforma EAD:</span>{" "}
              www.saintpharmacursos.com.br
            </p>

            <img
              src="/logo.png"
              alt="Logo"
              height={1000}
              width={1000}
              className="h-full max-h-[300px] w-auto absolute -z-10 opacity-10"
            />

            <div className="flex gap-5">
              {[...new Array(5)].map((_, index) => (
                <Star
                  className="fill-primary text-primary"
                  size={24}
                  key={index}
                />
              ))}
            </div>

            <p className="text-4xl font-semibold uppercase text-primary">
              certificado
            </p>

            <p className="text-xl uppercase">De conclusão SaintPharma cursos</p>

            <p className="text-xl font-semibold text-primary">
              {course.name} ({course.workload} Hrs)
            </p>

            <div>
              <div
                className={cn("text-4xl flex gap-2 mb-2", sacramento.className)}
              >
                <p>{user?.firstName}</p>
                <p>{user?.lastName}</p>
              </div>

              <Separator className="text-primary mt-4" />
            </div>

            <div className="text-primary flex flex-col items-center justify-center text-xs">
              <p className="text-center">
                A Farmavig cursos afirma por meio deste documento, que o(a)
                respectivo(a) aluno(a) concluiu com êxito esta formação
                profissionalizante em nossa plataforma EAD.
              </p>

              <p className="text-center">
                <span className="font-semibold"> Período de conclusão: </span>
                <span>
                  {format(new Date(certificate!.createdAt), "dd/MM/yyyy")}
                </span>
              </p>
            </div>

            <div className="flex justify-between gap-2">
              <div className="flex flex-col flex-[2]">
                <p className="font-semibold text-xs text-primary">
                  Conteúdo da formação
                </p>

                <p className="text-xs">{certificate!.description}</p>
              </div>

              <div className="flex flex-col flex-1 text-primary text-xs justify-center items-center relative w-full min-w-[220px]">
                <img
                  src="/assinatura_elaine.png"
                  alt="Assinatura"
                  className="h-16 w-auto mx-auto -mb-4"
                />
                <Separator />
                <p className="font-semibold text-center">
                  Elaine Cristina Wandeur da Costa
                </p>

                <p className="text-center">Mestre em ensino e saúde</p>
              </div>
            </div>
          </div>
        </div>

        {/* Render the generated certificate image */}
        {imageData && (
          <Image
            height={1000}
            width={1000}
            src={imageData}
            alt="Certificado"
            className="w-screen h-auto"
          />
        )}
      </div>

      <Button
        onClick={() => downloadPDF()}
        className="w-full mx-auto absolute bottom-0 rounded-b-none left-0"
      >
        Baixar certificado
      </Button>
    </>
  );
};

export default Certificate;
