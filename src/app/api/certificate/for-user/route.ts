import { createCertificate } from "@/actions/certification/create";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * POST /api/certificate/for-user
 * Cria ou retorna certificado existente para o usuário
 * 
 * Headers:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * 
 * Body:
 * - course: CourseProps (objeto do curso)
 */
export async function POST(request: NextRequest) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Obter Clerk ID do header
    const clerkId = request.headers.get("x-user-id");
    
    if (!clerkId) {
      return new Response(
        JSON.stringify({ 
          error: "Header X-User-Id é obrigatório",
          code: "MISSING_USER_ID"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar usuário no banco de dados
    const user = await getUserByClerkId(clerkId);
    
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

    const body = await request.json();
    const { course } = body;

    if (!course || !course._id) {
      return new Response(
        JSON.stringify({ error: "course é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("[API /certificate/for-user] Criando/buscando certificado:", {
      courseId: course._id,
      userId: user.id,
      clerkId: clerkId,
    });

    // Verificar se já existe certificado para este curso
    const { default: prisma } = await import("@/lib/prisma");
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId: user.id,
        courseCmsId: course._id,
      },
    });

    if (existingCertificate) {
      console.log("[API /certificate/for-user] Certificado já existe:", {
        id: existingCertificate.id,
        courseCmsId: existingCertificate.courseCmsId,
      });
      return successResponse({ certificate: existingCertificate }, 200);
    }

    // Normalizar o objeto course
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

    // Criar certificado usando a função createCertificate
    const certificate = await createCertificate({ 
      userId: user.id, 
      course: normalizedCourse 
    });

    if (!certificate || !certificate.id) {
      console.error("[API /certificate/for-user] Certificado inválido retornado");
      return serverErrorResponse("Erro ao criar certificado");
    }

    console.log("[API /certificate/for-user] Certificado criado com sucesso:", {
      id: certificate.id,
      courseId: certificate.courseCmsId,
    });

    return successResponse({ certificate }, 201);
  } catch (error) {
    console.error("[API /certificate/for-user] Erro:", error);
    return serverErrorResponse(
      error instanceof Error ? error.message : "Erro ao processar certificado"
    );
  }
}



