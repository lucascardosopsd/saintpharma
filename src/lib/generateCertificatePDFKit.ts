import PDFDocument from "pdfkit";
import { CourseProps } from "@/types/course";
import { Certificate as CertificateType } from "@prisma/client";
import { User } from "@clerk/nextjs/server";
import { format } from "date-fns";
import fetch from "node-fetch";

// Configurar fontes padrão do PDFKit
// PDFKit usa fontes padrão que não precisam de arquivos externos

type GeneratePDFOptions = {
  course: CourseProps;
  user: User;
  certificate: CertificateType;
  signatureUrl?: string;
  logoUrl?: string;
};

export async function generateCertificatePDFKit(
  options: GeneratePDFOptions
): Promise<Buffer> {
  const { course, user, certificate, signatureUrl, logoUrl } = options;

  return new Promise(async (resolve, reject) => {
    try {
      // Criar documento PDF em modo landscape (A4)
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: {
          top: 48,
          bottom: 48,
          left: 48,
          right: 48,
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Cores
      const primaryColor = "#1e40af"; // Azul primário
      const lightBlue = "#eff6ff";
      const darkGray = "#374151";

      // Borda decorativa (12px)
      doc
        .lineWidth(12)
        .strokeColor(primaryColor)
        .rect(0, 0, doc.page.width, doc.page.height)
        .stroke();

      // Logo de fundo (watermark) - se disponível
      if (logoUrl) {
        try {
          const logoResponse = await fetch(logoUrl);
          if (logoResponse.ok) {
            const logoBuffer = await logoResponse.buffer();
            // Adicionar logo como watermark (centro, opacidade baixa)
            const logoSize = 400;
            const logoX = (doc.page.width - logoSize) / 2;
            const logoY = (doc.page.height - logoSize) / 2;
            doc.image(logoBuffer, logoX, logoY, {
              width: logoSize,
              height: logoSize,
              opacity: 0.03,
            });
          }
        } catch (error) {
          console.error("Erro ao carregar logo:", error);
          // Continuar sem logo se houver erro
        }
      }

      // Cabeçalho (usar fontes padrão do PDFKit)
      doc
        .fontSize(11)
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Plataforma EAD: www.saintpharmacursos.com.br", {
          align: "center",
          y: 60,
        });

      // Estrelas (usando caracteres Unicode)
      const starY = 80;
      const starSize = 16;
      const starSpacing = 20;
      const startX = doc.page.width / 2 - (5 * starSpacing) / 2;
      for (let i = 0; i < 5; i++) {
        doc
          .fontSize(starSize)
          .fillColor(primaryColor)
          .text("★", startX + i * starSpacing, starY, {
            width: starSize,
            align: "center",
          });
      }

      // Título CERTIFICADO
      doc
        .fontSize(56)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("CERTIFICADO", {
          align: "center",
          y: 110,
        });

      // Subtítulo
      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor(darkGray)
        .text("De Conclusão", {
          align: "center",
          y: 170,
        });

      // Badge do Curso
      const courseBadgeY = 200;
      const courseBadgeWidth = 400;
      const courseBadgeX = (doc.page.width - courseBadgeWidth) / 2;
      const courseBadgeHeight = 80;

      // Fundo do badge
      doc
        .roundedRect(
          courseBadgeX,
          courseBadgeY,
          courseBadgeWidth,
          courseBadgeHeight,
          16
        )
        .fillColor(lightBlue)
        .fill()
        .strokeColor("#93c5fd")
        .lineWidth(2)
        .stroke();

      // Nome do curso
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(course.name, courseBadgeX + 20, courseBadgeY + 20, {
          width: courseBadgeWidth - 40,
          align: "center",
        });

      // Horas
      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#3b82f6")
        .text(`(${course.workload} Horas)`, courseBadgeX + 20, courseBadgeY + 50, {
          width: courseBadgeWidth - 40,
          align: "center",
        });

      // Nome do aluno (cursivo simulado)
      doc
        .fontSize(64)
        .font("Helvetica-Oblique")
        .fillColor(primaryColor)
        .text(`${user.firstName} ${user.lastName}`, {
          align: "center",
          y: 320,
        });

      // Texto de certificação
      const certText =
        "A SaintPharma cursos afirma por meio deste documento, que o(a) respectivo(a) aluno(a) concluiu com êxito esta formação profissionalizante em nossa plataforma EAD.";
      doc
        .fontSize(14)
        .font("Helvetica")
        .fillColor(darkGray)
        .text(certText, {
          align: "center",
          y: 420,
          width: 600,
        });

      // Badge da data
      const dateBadgeY = 480;
      const dateBadgeWidth = 350;
      const dateBadgeX = (doc.page.width - dateBadgeWidth) / 2;
      const dateBadgeHeight = 50;

      doc
        .roundedRect(
          dateBadgeX,
          dateBadgeY,
          dateBadgeWidth,
          dateBadgeHeight,
          12
        )
        .fillColor(lightBlue)
        .fill()
        .strokeColor("#93c5fd")
        .lineWidth(2)
        .stroke();

      const dateText = `Período de conclusão: ${format(
        new Date(certificate.createdAt),
        "dd/MM/yyyy"
      )}`;
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(dateText, dateBadgeX + 20, dateBadgeY + 15, {
          width: dateBadgeWidth - 40,
          align: "center",
        });

      // Rodapé
      const footerY = doc.page.height - 120;

      // Descrição do curso (lado esquerdo)
      const description = certificate.description || course.description || "";
      if (description) {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text("Conteúdo da formação", 60, footerY, {
            width: 300,
          });

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#000000")
          .text(description, 60, footerY + 20, {
            width: 300,
            lineGap: 4,
          });
      }

      // Assinatura (lado direito)
      const signatureX = doc.page.width - 280;
      let signatureY = footerY;

      // Imagem da assinatura (se disponível)
      if (signatureUrl) {
        try {
          const signatureResponse = await fetch(signatureUrl);
          if (signatureResponse.ok) {
            const signatureBuffer = await signatureResponse.buffer();
            // Adicionar imagem da assinatura
            const signatureHeight = 56;
            const signatureWidth = 200;
            doc.image(signatureBuffer, signatureX, signatureY, {
              width: signatureWidth,
              height: signatureHeight,
              fit: [signatureWidth, signatureHeight],
            });
            signatureY += signatureHeight + 4; // Espaço após a imagem
          } else {
            throw new Error("Falha ao carregar assinatura");
          }
        } catch (error) {
          console.error("Erro ao carregar assinatura:", error);
          // Continuar sem imagem se houver erro
          signatureY += 20;
        }
      } else {
        signatureY += 20;
      }

      // Linha separadora
      doc
        .moveTo(signatureX, signatureY)
        .lineTo(signatureX + 200, signatureY)
        .strokeColor(darkGray)
        .lineWidth(1.5)
        .stroke();

      // Nome da assinatura
      doc
        .fontSize(16)
        .font("Helvetica-Oblique")
        .fillColor(primaryColor)
        .text("Elaine Cristina Wandeur da Costa", signatureX, signatureY + 8, {
          width: 200,
          align: "center",
        });

      // Título
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(darkGray)
        .text("Mestre em ensino e saúde", signatureX, signatureY + 28, {
          width: 200,
          align: "center",
        });

      // Finalizar documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

