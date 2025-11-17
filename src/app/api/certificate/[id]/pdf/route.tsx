import { NextRequest, NextResponse } from "next/server";
import { getCertificateById } from "@/actions/certification/getById";
import { getCourseById } from "@/actions/courses/getId";
import { getUserById } from "@/actions/user/getUserByClerk";
import { generateCertificatePuppeteer } from "@/lib/generateCertificatePuppeteer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar certificado (rota pública, sem autenticação)
    const certificate = await getCertificateById({ id });

    if (!certificate) {
      console.error("[PDF Route] Certificado não encontrado:", id);
      return new NextResponse("Certificado não encontrado", { status: 404 });
    }

    console.log("[PDF Route] Certificado encontrado:", {
      certificateId: certificate.id,
      certificateUserId: certificate.userId,
    });

    // Buscar usuário pelo ID do banco de dados (sem autenticação)
    if (!certificate.userId) {
      console.error("[PDF Route] Certificado inválido - sem userId");
      return new NextResponse("Certificado inválido", { status: 400 });
    }

    const user = await getUserById(certificate.userId);
    if (!user) {
      console.error("[PDF Route] Usuário não encontrado no banco de dados");
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    console.log("[PDF Route] Usuário encontrado:", {
      userDbId: user.id,
    });

    // Criar objeto compatível com o formato esperado pelo generateCertificatePuppeteer
    const clerkUserLike = {
      id: user.clerkId,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      emailAddresses: [{ emailAddress: user.email }],
      imageUrl: user.profileImage || "",
      primaryEmailAddressId: user.email,
    } as any;

    console.log("[PDF Route] Gerando PDF...");

    // Buscar curso
    const course = await getCourseById({ id: certificate.courseCmsId });
    if (!course) {
      return new NextResponse("Curso não encontrado", { status: 404 });
    }

    // Obter URLs absolutas das imagens
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const signatureUrl = `${baseUrl}/assinatura_elaine.png`;
    const logoUrl = `${baseUrl}/logo.png`;

    console.log("[PDF Route] URLs das imagens:", { signatureUrl, logoUrl });

    // Gerar PDF usando Puppeteer
    console.log("[PDF Route] Iniciando geração do PDF com Puppeteer...");
    let pdfBuffer: Buffer;
    try {
      // Adicionar timeout de 60 segundos (Puppeteer pode demorar mais)
      const generatePromise = generateCertificatePuppeteer({
        course,
        user: clerkUserLike,
        certificate,
        signatureUrl,
        logoUrl,
        baseUrl,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ao gerar PDF (60s)")), 60000)
      );

      pdfBuffer = (await Promise.race([
        generatePromise,
        timeoutPromise,
      ])) as Buffer;
      console.log(
        "[PDF Route] PDF gerado com sucesso, tamanho:",
        pdfBuffer.length,
        "bytes"
      );
    } catch (renderError) {
      console.error("[PDF Route] Erro ao gerar PDF:", renderError);
      throw new Error(
        `Erro ao gerar PDF: ${
          renderError instanceof Error
            ? renderError.message
            : String(renderError)
        }`
      );
    }

    // Sanitizar nome do arquivo
    const sanitizeFileName = (name: string): string => {
      return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .trim();
    };

    const fileName = `${sanitizeFileName(course.name)}.pdf`;

    // Converter Buffer para formato aceito pelo NextResponse
    const pdfBytes = new Uint8Array(pdfBuffer);

    // Retornar PDF
    return new NextResponse(pdfBytes.buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "N/A");
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro ao gerar PDF",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
