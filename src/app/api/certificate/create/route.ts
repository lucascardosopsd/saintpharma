import { createCertificate } from "@/actions/certification/create";
import {
  logAuditEvent,
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { userId, course } = body;

    if (!userId || !course) {
      return new Response(
        JSON.stringify({ error: "userId e course são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const certificate = await createCertificate({ userId, course });

    // Log de auditoria para criação de certificado
    logAuditEvent(userId, "CREATE", "certificate", certificate.id, {
      courseTitle: course.title,
      courseId: course.id,
      points: certificate.points,
      workload: certificate.workload,
    });

    return successResponse({ certificate }, 201);
  } catch (error) {
    console.error("Erro ao criar certificado:", error);
    return serverErrorResponse("Erro ao criar certificado");
  }
}
