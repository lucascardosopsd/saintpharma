import { createCertificateForUser } from "@/actions/certification/create";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
} from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * POST /api/certificate/for-user
 * Cria ou retorna certificado existente para o usuário autenticado
 * 
 * Body:
 * - course: CourseProps (objeto do curso)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação via Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return unauthorizedResponse("Usuário não autenticado");
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
      userId: clerkUser.id,
    });

    // Usar a função existente que já faz toda a lógica
    const certificate = await createCertificateForUser({ course });

    if (!certificate || !certificate.id) {
      console.error("[API /certificate/for-user] Certificado inválido retornado");
      return serverErrorResponse("Erro ao criar/buscar certificado");
    }

    console.log("[API /certificate/for-user] Certificado retornado com sucesso:", {
      id: certificate.id,
      courseId: certificate.courseCmsId,
    });

    return successResponse({ certificate }, 200);
  } catch (error) {
    console.error("[API /certificate/for-user] Erro:", error);
    return serverErrorResponse(
      error instanceof Error ? error.message : "Erro ao processar certificado"
    );
  }
}



