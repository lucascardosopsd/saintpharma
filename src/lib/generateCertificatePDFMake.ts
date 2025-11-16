import { CourseProps } from "@/types/course";
import { Certificate as CertificateType } from "@prisma/client";
import { User } from "@clerk/nextjs/server";
import { format } from "date-fns";
import fetch from "node-fetch";

// Importar pdfmake corretamente para servidor
const PdfPrinter = require("pdfmake/src/printer");
import { TDocumentDefinitions } from "pdfmake/interfaces";

type GeneratePDFOptions = {
  course: CourseProps;
  user: User;
  certificate: CertificateType;
  signatureUrl?: string;
  logoUrl?: string;
};

export async function generateCertificatePDFMake(
  options: GeneratePDFOptions
): Promise<Buffer> {
  const { course, user, certificate, signatureUrl, logoUrl } = options;

  // Fontes padrão do pdfmake usando fontes do sistema
  // Não precisa de arquivos vfs_fonts
  const fonts = {
    Roboto: {
      normal: Buffer.from(
        "AAEAAAAOAIAAAwBgT1MvMj3hSQEAAADsAAAATmNtYXDQEhm3AAABPAAAUpRjdnQgBkYBSQAAApwAAAAUZnBnbYoKeDsAAAJQAAAJkWdhc3AAAAAQAAACUAAAAAhnbHlm32cEdgAAAPAAAAA8aGVhZAERwxcAAAD0AAAANmhoZWEHUwNNAAABJAAAACRobXR4C84VggAAAbgAAAN8bG9jYQA4AFYAAAIEAAAAGG1heHAABwAjAAABOAAAACBuYW1l1u1N5gAABLwAAAIKcG9zdP/uABkAAAVkAAAARA==",
        "base64"
      ),
      bold: Buffer.from(
        "AAEAAAAOAIAAAwBgT1MvMj3hSQEAAADsAAAATmNtYXDQEhm3AAABPAAAUpRjdnQgBkYBSQAAApwAAAAUZnBnbYoKeDsAAAJQAAAJkWdhc3AAAAAQAAACUAAAAAhnbHlm32cEdgAAAPAAAAA8aGVhZAERwxcAAAD0AAAANmhoZWEHUwNNAAABJAAAACRobXR4C84VggAAAbgAAAN8bG9jYQA4AFYAAAIEAAAAGG1heHAABwAjAAABOAAAACBuYW1l1u1N5gAABLwAAAIKcG9zdP/uABkAAAVkAAAARA==",
        "base64"
      ),
      italics: Buffer.from(
        "AAEAAAAOAIAAAwBgT1MvMj3hSQEAAADsAAAATmNtYXDQEhm3AAABPAAAUpRjdnQgBkYBSQAAApwAAAAUZnBnbYoKeDsAAAJQAAAJkWdhc3AAAAAQAAACUAAAAAhnbHlm32cEdgAAAPAAAAA8aGVhZAERwxcAAAD0AAAANmhoZWEHUwNNAAABJAAAACRobXR4C84VggAAAbgAAAN8bG9jYQA4AFYAAAIEAAAAGG1heHAABwAjAAABOAAAACBuYW1l1u1N5gAABLwAAAIKcG9zdP/uABkAAAVkAAAARA==",
        "base64"
      ),
      bolditalics: Buffer.from(
        "AAEAAAAOAIAAAwBgT1MvMj3hSQEAAADsAAAATmNtYXDQEhm3AAABPAAAUpRjdnQgBkYBSQAAApwAAAAUZnBnbYoKeDsAAAJQAAAJkWdhc3AAAAAQAAACUAAAAAhnbHlm32cEdgAAAPAAAAA8aGVhZAERwxcAAAD0AAAANmhoZWEHUwNNAAABJAAAACRobXR4C84VggAAAbgAAAN8bG9jYQA4AFYAAAIEAAAAGG1heHAABwAjAAABOAAAACBuYW1l1u1N5gAABLwAAAIKcG9zdP/uABkAAAVkAAAARA==",
        "base64"
      ),
    },
  };

  // Criar printer sem vfs (virtual file system)
  const printer = new PdfPrinter(fonts);

  // Cores
  const primaryColor = "#1e40af";
  const lightBlue = "#eff6ff";
  const darkGray = "#374151";

  // Baixar imagens se disponíveis
  let signatureImage: string | undefined;
  let logoImage: string | undefined;

  if (signatureUrl) {
    try {
      const response = await fetch(signatureUrl);
      if (response.ok) {
        const buffer = await response.buffer();
        signatureImage = `data:image/png;base64,${buffer.toString("base64")}`;
      }
    } catch (error) {
      console.error("Erro ao carregar assinatura:", error);
    }
  }

  if (logoUrl) {
    try {
      const response = await fetch(logoUrl);
      if (response.ok) {
        const buffer = await response.buffer();
        logoImage = `data:image/png;base64,${buffer.toString("base64")}`;
      }
    } catch (error) {
      console.error("Erro ao carregar logo:", error);
    }
  }

  const description = certificate.description || course.description || "";

  // Definir documento PDF
  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [48, 48, 48, 48],
    background: [
      // Borda decorativa
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 842, // A4 landscape width
            h: 595, // A4 landscape height
            lineWidth: 12,
            lineColor: primaryColor,
          },
        ],
      },
      // Logo de fundo (watermark)
      ...(logoImage
        ? [
            {
              image: logoImage,
              width: 400,
              height: 400,
              absolutePosition: { x: 221, y: 97.5 }, // Centralizado
              opacity: 0.03,
            },
          ]
        : []),
    ],
    content: [
      // Cabeçalho
      {
        text: "Plataforma EAD: www.saintpharmacursos.com.br",
        fontSize: 11,
        color: primaryColor,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 12],
      },

      // Estrelas
      {
        text: "★ ★ ★ ★ ★",
        fontSize: 16,
        color: primaryColor,
        alignment: "center",
        margin: [0, 0, 0, 12],
      },

      // Título CERTIFICADO
      {
        text: "CERTIFICADO",
        fontSize: 56,
        color: primaryColor,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 8],
      },

      // Subtítulo
      {
        text: "De Conclusão",
        fontSize: 14,
        color: darkGray,
        alignment: "center",
        margin: [0, 0, 0, 16],
      },

      // Badge do Curso
      {
        stack: [
          {
            text: course.name,
            fontSize: 24,
            color: primaryColor,
            bold: true,
            alignment: "center",
            margin: [0, 0, 0, 4],
          },
          {
            text: `(${course.workload} Horas)`,
            fontSize: 12,
            color: "#3b82f6",
            alignment: "center",
          },
        ],
        margin: [0, 0, 0, 16],
        fillColor: lightBlue,
        border: [true, true, true, true],
        borderColor: "#93c5fd",
        borderWidth: 2,
        borderRadius: 16,
        padding: [16, 40],
      },

      // Nome do Aluno
      {
        text: `${user.firstName} ${user.lastName}`,
        fontSize: 64,
        color: primaryColor,
        italics: true,
        alignment: "center",
        margin: [0, 0, 0, 20],
      },

      // Texto de certificação
      {
        text:
          "A SaintPharma cursos afirma por meio deste documento, que o(a) respectivo(a) aluno(a) concluiu com êxito esta formação profissionalizante em nossa plataforma EAD.",
        fontSize: 14,
        color: darkGray,
        alignment: "center",
        margin: [0, 0, 0, 16],
        lineHeight: 1.6,
      },

      // Badge da Data
      {
        text: `Período de conclusão: ${format(
          new Date(certificate.createdAt),
          "dd/MM/yyyy"
        )}`,
        fontSize: 14,
        color: primaryColor,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 40],
        fillColor: lightBlue,
        border: [true, true, true, true],
        borderColor: "#93c5fd",
        borderWidth: 2,
        borderRadius: 12,
        padding: [12, 32],
      },

      // Rodapé - Descrição e Assinatura
      {
        columns: [
          // Descrição (lado esquerdo)
          ...(description
            ? [
                {
                  width: "*",
                  stack: [
                    {
                      text: "Conteúdo da formação",
                      fontSize: 14,
                      color: "#000000",
                      bold: true,
                      margin: [0, 0, 0, 8],
                    },
                    {
                      text: description,
                      fontSize: 11,
                      color: "#000000",
                      lineHeight: 1.6,
                    },
                  ],
                },
              ]
            : []),
          // Assinatura (lado direito)
          {
            width: description ? 200 : "*",
            stack: [
              ...(signatureImage
                ? [
                    {
                      image: signatureImage,
                      width: 200,
                      height: 56,
                      alignment: "center",
                      margin: [0, 0, 0, 4],
                    },
                  ]
                : []),
              {
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: 200,
                    y2: 0,
                    lineWidth: 1.5,
                    lineColor: darkGray,
                  },
                ],
                margin: [0, 4, 0, 8],
              },
              {
                text: "Elaine Cristina Wandeur da Costa",
                fontSize: 16,
                color: primaryColor,
                italics: true,
                alignment: "center",
                margin: [0, 0, 0, 2],
              },
              {
                text: "Mestre em ensino e saúde",
                fontSize: 10,
                color: darkGray,
                alignment: "center",
              },
            ],
            alignment: description ? "right" : "center",
          },
        ],
        margin: [0, "auto", 0, 0],
      },
    ],
  };

  // Gerar PDF
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });
}

