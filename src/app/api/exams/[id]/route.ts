import { NextRequest } from "next/server";
import { validateApiToken, unauthorizedResponse, serverErrorResponse, successResponse } from "@/lib/auth";
import { updateExam } from "@/actions/exam/updateExam";
import { getExamById } from "@/actions/exam/getExamById";
import { getUserByClerk } from "@/actions/user/getUserByClerk";
import { createUserLecture } from "@/actions/lecture/createUserLecture";
import { getUserLectureById } from "@/actions/lecture/getUserLectureById";
import { createDamage } from "@/actions/damage/createDamage";
import { getCourseById } from "@/actions/courses/getId";

/**
 * PUT /api/exams/[id]
 * Atualiza um exame (concluir ou reprovar)
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 * 
 * Body:
 * {
 *   "complete": boolean,
 *   "reproved": boolean,
 *   "courseId": "string" (obrigatório se complete = true)
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id: examId } = params;
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

    if (!examId) {
      return new Response(
        JSON.stringify({ error: "ID do exame é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { complete, reproved, courseId } = body;

    // Verificar se usuário existe
    const user = await getUserByClerk();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se exame existe
    const exam = await getExamById({ id: examId });
    if (!exam) {
      return new Response(
        JSON.stringify({ error: "Exame não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o exame pertence ao usuário
    if (exam.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Acesso negado ao exame" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Se está concluindo o exame
    if (complete) {
      if (!courseId) {
        return new Response(
          JSON.stringify({ error: "courseId é obrigatório para concluir exame" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Atualizar exame como concluído
      const updatedExam = await updateExam({
        id: examId,
        data: {
          complete: true,
          reproved: false,
          lectureCMSid: exam.lectureCMSid,
          userId: user.id
        }
      });

      // Verificar se já existe UserLecture
      const existingUserLecture = await getUserLectureById({
        lectureCmsId: exam.lectureCMSid,
        userId: user.id
      });

      // Criar UserLecture se não existir
      if (!existingUserLecture) {
        await createUserLecture({
          data: {
            lectureCmsId: exam.lectureCMSid,
            courseId,
            userId: user.id
          }
        });
      }

      return successResponse({
        message: "Exame concluído com sucesso",
        exam: updatedExam,
        lectureCompleted: true
      });
    }

    // Se está reprovando o exame
    if (reproved) {
      // Atualizar exame como reprovado
      const updatedExam = await updateExam({
        id: examId,
        data: {
          complete: false,
          reproved: true,
          lectureCMSid: exam.lectureCMSid,
          userId: user.id
        }
      });

      // Criar dano (perder vida)
      await createDamage({
        userId: user.id
      });

      return successResponse({
        message: "Exame reprovado, vida perdida",
        exam: updatedExam,
        lifeLost: true
      });
    }

    // Atualização genérica
    const updatedExam = await updateExam({
      id: examId,
      data: {
        complete: complete || false,
        reproved: reproved || false,
        lectureCMSid: exam.lectureCMSid,
        userId: user.id
      }
    });

    return successResponse({
      message: "Exame atualizado com sucesso",
      exam: updatedExam
    });
  } catch (error) {
    console.error("Erro ao atualizar exame:", error);
    return serverErrorResponse("Erro ao atualizar exame");
  }
}

/**
 * GET /api/exams/[id]
 * Busca detalhes de um exame específico
 * 
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id: examId } = params;
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

    if (!examId) {
      return new Response(
        JSON.stringify({ error: "ID do exame é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se usuário existe
    const user = await getUserByClerk();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Buscar exame
    const exam = await getExamById({ id: examId });
    if (!exam) {
      return new Response(
        JSON.stringify({ error: "Exame não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o exame pertence ao usuário
    if (exam.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Acesso negado ao exame" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return successResponse(exam);
  } catch (error) {
    console.error("Erro ao buscar exame:", error);
    return serverErrorResponse("Erro ao buscar exame");
  }
}