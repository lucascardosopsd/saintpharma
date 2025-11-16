import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getCourseById } from "@/actions/courses/getId";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import { generateCertificatePuppeteer } from "@/lib/generateCertificatePuppeteer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar autenticação usando auth() que funciona com o middleware
    const { userId } = await auth();
    if (!userId) {
      console.error("[PDF Route] Usuário não autenticado");
      return new NextResponse("Não autorizado - usuário não autenticado", {
        status: 401,
      });
    }

    console.log("[PDF Route] Usuário autenticado:", userId);

    // Buscar dados do usuário do Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.error("[PDF Route] Dados do usuário não encontrados no Clerk");
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    // Buscar certificado
    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      console.error("[PDF Route] Certificado não encontrado:", id);
      return new NextResponse("Certificado não encontrado", { status: 404 });
    }

    console.log("[PDF Route] Certificado encontrado:", {
      certificateId: certificate.id,
      certificateUserId: certificate.userId,
      currentClerkUserId: userId,
    });

    // Buscar usuário no banco de dados usando o Clerk ID
    const user = await getUserByClerkId(userId);
    if (!user) {
      console.error("[PDF Route] Usuário não encontrado no banco de dados");
      return new NextResponse("Usuário não encontrado no sistema", {
        status: 404,
      });
    }

    console.log("[PDF Route] Usuário do banco encontrado:", {
      userDbId: user.id,
      certificateUserId: certificate.userId,
    });

    // Verificar se o certificado pertence ao usuário (comparar IDs do banco)
    if (certificate.userId !== user.id) {
      console.error("[PDF Route] Certificado não pertence ao usuário:", {
        certificateUserId: certificate.userId,
        userDbId: user.id,
      });
      return new NextResponse(
        "Não autorizado - certificado não pertence ao usuário",
        { status: 403 }
      );
    }

    console.log("[PDF Route] Autorização confirmada, gerando PDF...");

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
        user: clerkUser,
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
