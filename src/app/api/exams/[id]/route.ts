import { createDamage } from "@/actions/damage/createDamage";
import { deleteExam } from "@/actions/exam/deleteExam";
import { getExamById } from "@/actions/exam/getExamById";
import { updateExam } from "@/actions/exam/updateExam";
import { createUserLecture } from "@/actions/lecture/createUserLecture";
import { getUserLectureById } from "@/actions/lecture/getUserLectureById";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  forbiddenResponse,
  logAuditEvent,
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
  validateResourceOwnership,
} from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

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
  { params }: { params: Promise<{ id: string }> }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Next.js 15: params agora é uma Promise e precisa ser aguardado
    const { id: examId } = await params;
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
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar se exame existe
    const exam = await getExamById({ id: examId });
    if (!exam) {
      return new Response(JSON.stringify({ error: "Exame não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar se o exame pertence ao usuário
    if (!validateResourceOwnership(exam.userId, user.id)) {
      logAuditEvent(user.id, "ACCESS_DENIED", "exam", examId, {
        reason: "Resource ownership validation failed",
        action: "UPDATE",
      });
      return forbiddenResponse("Acesso negado ao exame");
    }

    // Se está concluindo o exame
    if (complete) {
      if (!courseId) {
        return new Response(
          JSON.stringify({
            error: "courseId é obrigatório para concluir exame",
          }),
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
          userId: user.id,
        },
      });

      // Verificar se já existe UserLecture
      const existingUserLecture = await getUserLectureById({
        lectureCmsId: exam.lectureCMSid,
        userId: user.id,
      });

      // Criar UserLecture se não existir
      if (!existingUserLecture) {
        await createUserLecture({
          data: {
            lectureCmsId: exam.lectureCMSid,
            courseId,
            userId: user.id,
          },
        });

        // Award points for completing exam and lecture
        const examPoints = 10; // 10 points for completing exam
        const lecturePoints = 5; // 5 points for completing lecture

        await prisma.user.update({
          where: { id: user.id },
          data: {
            points: {
              increment: examPoints + lecturePoints,
            },
          },
        });

        console.log(
          `[POINTS] User ${user.id} earned ${examPoints + lecturePoints} points for completing exam ${examId} and lecture ${exam.lectureCMSid}`
        );
      } else {
        // Award points only for completing exam (lecture already completed)
        const examPoints = 10;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            points: {
              increment: examPoints,
            },
          },
        });

        console.log(
          `[POINTS] User ${user.id} earned ${examPoints} points for completing exam ${examId}`
        );
      }

      return successResponse({
        message: "Exame concluído com sucesso",
        exam: updatedExam,
        lectureCompleted: true,
        pointsEarned: existingUserLecture ? 10 : 15, // 10 for exam only, 15 for exam + lecture
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
          userId: user.id,
        },
      });

      // Criar dano (perder vida)
      await createDamage({
        userId: user.id,
      });

      return successResponse({
        message: "Exame reprovado, vida perdida",
        exam: updatedExam,
        lifeLost: true,
      });
    }

    // Atualização genérica
    const updatedExam = await updateExam({
      id: examId,
      data: {
        complete: complete || false,
        reproved: reproved || false,
        lectureCMSid: exam.lectureCMSid,
        userId: user.id,
      },
    });

    // Log de auditoria para atualização do exame
    logAuditEvent(user.id, "UPDATE", "exam", examId, {
      complete,
      reproved,
      courseId,
      previousState: { complete: exam.complete, reproved: exam.reproved },
    });

    return successResponse({
      message: "Exame atualizado com sucesso",
      exam: updatedExam,
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
  { params }: { params: Promise<{ id: string }> }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    // Next.js 15: params agora é uma Promise e precisa ser aguardado
    const { id: examId } = await params;
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
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buscar exame
    const exam = await getExamById({ id: examId });
    if (!exam) {
      return new Response(JSON.stringify({ error: "Exame não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar se o exame pertence ao usuário
    if (!validateResourceOwnership(exam.userId, user.id)) {
      logAuditEvent(user.id, "ACCESS_DENIED", "exam", examId, {
        reason: "Resource ownership validation failed",
      });
      return forbiddenResponse("Acesso negado ao exame");
    }

    // Log de auditoria para acesso ao exame
    logAuditEvent(user.id, "VIEW", "exam", examId);

    return successResponse(exam);
  } catch (error) {
    console.error("Erro ao buscar exame:", error);
    return serverErrorResponse("Erro ao buscar exame");
  }
}

/**
 * DELETE /api/exams/{id}
 * Deleta um exame específico
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Params:
 * - id: ID do exame
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validar token de API
  if (!validateApiToken(request)) {
    return unauthorizedResponse();
  }

  try {
    const userId = request.headers.get("x-user-id");
    // Next.js 15: params agora é uma Promise e precisa ser aguardado
    const { id } = await params;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Header X-User-Id é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID do exame é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se usuário existe
    const user = await getUserByClerkId(userId);
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verificar se o exame existe e pertence ao usuário
    const exam = await getExamById({ id });
    if (!exam) {
      return new Response(JSON.stringify({ error: "Exame não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!validateResourceOwnership(exam.userId, user.id)) {
      logAuditEvent(user.id, "ACCESS_DENIED", "exam", id, {
        reason: "Resource ownership validation failed",
        action: "DELETE",
      });
      return forbiddenResponse("Não autorizado a deletar este exame");
    }

    // Log de auditoria antes de deletar
    logAuditEvent(user.id, "DELETE", "exam", id, {
      examData: {
        lectureCMSid: exam.lectureCMSid,
        complete: exam.complete,
        reproved: exam.reproved,
        createdAt: exam.createdAt,
      },
    });

    // Deletar exame
    await deleteExam({ id });

    return successResponse({ message: "Exame deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar exame:", error);
    return serverErrorResponse("Erro ao deletar exame");
  }
}
