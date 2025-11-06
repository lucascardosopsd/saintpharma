import { createCertificate } from "@/actions/certification/create";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
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
    const { userId: userIdOrClerkId, course } = body;

    if (!userIdOrClerkId || !course) {
      return new Response(
        JSON.stringify({ error: "userId (ou clerkId) e course são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se é um clerkId (começa com "user_") ou userId do MongoDB
    let userId: string;
    if (userIdOrClerkId.startsWith("user_")) {
      // É um clerkId, precisa converter para userId do MongoDB
      const user = await getUserByClerkId(userIdOrClerkId);
      if (!user) {
        return new Response(
          JSON.stringify({ 
            error: "Usuário não encontrado",
            code: "USER_NOT_FOUND"
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      userId = user.id;
    } else {
      // Já é um userId do MongoDB
      userId = userIdOrClerkId;
    }

    // Normalizar o objeto course para garantir que tenha todos os campos necessários
    const normalizedCourse = {
      _id: course._id || course.id,
      name: course.name || course.title || course.courseTitle || "",
      description: course.description || "",
      points: course.points ?? 0,
      workload: course.workload ?? 0,
      premiumPoints: course.premiumPoints ?? 0,
      banner: course.banner || { asset: { url: "" } },
      slug: course.slug,
    };

    const certificate = await createCertificate({ userId, course: normalizedCourse });

    // Log de auditoria para criação de certificado
    logAuditEvent(userId, "CREATE", "certificate", certificate.id, {
      courseTitle: normalizedCourse.name,
      courseId: normalizedCourse._id,
      points: certificate.points,
      workload: certificate.workload,
      originalUserIdOrClerkId: userIdOrClerkId,
    });

    return successResponse({ certificate }, 201);
  } catch (error) {
    console.error("Erro ao criar certificado:", error);
    return serverErrorResponse("Erro ao criar certificado");
  }
}
