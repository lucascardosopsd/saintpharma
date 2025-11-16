import puppeteer from "puppeteer";
import { CourseProps } from "@/types/course";
import { Certificate as CertificateType } from "@prisma/client";
import { User } from "@clerk/nextjs/server";
import { format } from "date-fns";

type GeneratePDFOptions = {
  course: CourseProps;
  user: User;
  certificate: CertificateType;
  signatureUrl?: string;
  logoUrl?: string;
  baseUrl: string;
};

export async function generateCertificatePuppeteer(
  options: GeneratePDFOptions
): Promise<Buffer> {
  const { course, user, certificate, signatureUrl, logoUrl, baseUrl } = options;

  // Criar HTML do certificado
  const description = certificate.description || course.description || "";
  
  // Nome completo do usuário (tratar caso lastName seja null)
  const fullName = user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || "Aluno";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    @page {
      size: 842px 595px;
      margin: 0;
    }
    body {
      font-family: Arial, sans-serif;
      width: 842px;
      height: 595px;
      position: relative;
      background: white;
      overflow: hidden;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    .border {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 12px solid #1e40af;
      pointer-events: none;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 400px;
      opacity: 0.03;
      pointer-events: none;
    }
    .container {
      padding: 40px 48px;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    .header {
      text-align: center;
      margin-bottom: 16px;
    }
    .platform {
      font-size: 10px;
      color: #1e40af;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .stars {
      font-size: 14px;
      color: #1e40af;
      margin-bottom: 8px;
      letter-spacing: 6px;
    }
    .title {
      font-size: 48px;
      font-weight: bold;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .course-badge {
      background: #eff6ff;
      border: 2px solid #93c5fd;
      border-radius: 12px;
      padding: 12px 32px;
      margin: 0 auto 12px;
      text-align: center;
      max-width: 380px;
    }
    .course-name {
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 3px;
    }
    .course-hours {
      font-size: 11px;
      color: #3b82f6;
    }
    .student-name {
      font-size: 52px;
      color: #1e40af;
      text-align: center;
      font-style: italic;
      margin-bottom: 14px;
    }
    .cert-text {
      font-size: 13px;
      color: #374151;
      text-align: center;
      max-width: 580px;
      margin: 0 auto 12px;
      line-height: 1.5;
    }
    .date-badge {
      background: #eff6ff;
      border: 2px solid #93c5fd;
      border-radius: 10px;
      padding: 10px 28px;
      margin: 0 auto 14px;
      text-align: center;
      max-width: 330px;
    }
    .date-text {
      font-size: 13px;
      color: #1e40af;
      font-weight: bold;
    }
    .footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 24px;
    }
    .description-section {
      flex: 2;
      max-height: 80px;
      overflow: hidden;
    }
    .description-title {
      font-size: 12px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 6px;
    }
    .description-text {
      font-size: 10px;
      color: #000000;
      line-height: 1.4;
    }
    .signature-section {
      flex: 1;
      text-align: center;
      min-width: 180px;
    }
    .signature-image {
      height: 48px;
      width: auto;
      margin-bottom: 3px;
    }
    .signature-line {
      width: 100%;
      height: 1.5px;
      background: #374151;
      margin: 3px 0;
    }
    .signature-name {
      font-size: 14px;
      color: #1e40af;
      font-style: italic;
      margin-top: 3px;
    }
    .signature-title {
      font-size: 9px;
      color: #6b7280;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="border"></div>
  ${logoUrl ? `<img src="${logoUrl}" class="watermark" alt="Logo" />` : ""}
  <div class="container">
    <div class="header">
      <div class="platform">Plataforma EAD: www.saintpharmacursos.com.br</div>
      <div class="stars">★★★★★</div>
      <div class="title">CERTIFICADO</div>
      <div class="subtitle">De Conclusão</div>
    </div>
    
    <div class="course-badge">
      <div class="course-name">${course.name}</div>
      <div class="course-hours">(${course.workload} Horas)</div>
    </div>
    
    <div class="student-name">${fullName}</div>
    
    <div class="cert-text">
      A SaintPharma cursos afirma por meio deste documento, que o(a)
      respectivo(a) aluno(a) concluiu com êxito esta formação
      profissionalizante em nossa plataforma EAD.
    </div>
    
    <div class="date-badge">
      <div class="date-text">
        Período de conclusão: ${format(new Date(certificate.createdAt), "dd/MM/yyyy")}
      </div>
    </div>
    
    <div class="footer">
      ${description ? `
        <div class="description-section">
          <div class="description-title">Conteúdo da formação</div>
          <div class="description-text">${description}</div>
        </div>
      ` : ""}
      <div class="signature-section">
        ${signatureUrl ? `<img src="${signatureUrl}" class="signature-image" alt="Assinatura" />` : ""}
        <div class="signature-line"></div>
        <div class="signature-name">Elaine Cristina Wandeur da Costa</div>
        <div class="signature-title">Mestre em ensino e saúde</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // Iniciar Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    
    // Definir viewport para A4 landscape
    await page.setViewport({
      width: 842,
      height: 595,
    });

    // Carregar HTML
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Gerar PDF
    const pdfBuffer = await page.pdf({
      width: "842px",
      height: "595px",
      printBackground: true,
      preferCSSPageSize: true,
      pageRanges: "1", // Gerar apenas a primeira página
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

