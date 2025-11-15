import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { createUserLecture } from "@/actions/lecture/createUserLecture";
import { getUserLectureById } from "@/actions/lecture/getUserLectureById";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";

/**
 * POST /api/lectures/[id]/complete
 * Marca uma aula como concluída
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * 
 * Body:
 * {
 *   "courseId": "string"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Next.js 15: params agora é uma Promise e precisa ser aguardado
    const { id: lectureId } = await params;
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Header X-User-Id é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!lectureId) {
      return new Response(
        JSON.stringify({ error: "ID da aula é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "courseId é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se usuário existe
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se a aula já foi concluída
    const existingUserLecture = await getUserLectureById({
      lectureCmsId: lectureId,
      userId: user.id
    });

    if (existingUserLecture) {
      return new Response(
        JSON.stringify({ 
          error: "Aula já foi concluída",
          userLecture: existingUserLecture
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Criar registro de aula concluída
    const userLecture = await createUserLecture({
      data: {
        lectureCmsId: lectureId,
        courseId,
        userId: user.id
      }
    });

    return successResponse({
      message: "Aula marcada como concluída",
      userLecture
    });
  } catch (error) {
    console.error("Erro ao marcar aula como concluída:", error);
    return serverErrorResponse("Erro ao marcar aula como concluída");
  }
}