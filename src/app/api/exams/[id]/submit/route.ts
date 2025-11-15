import { submitExamAnswers } from "@/actions/exam/submitExamAnswers";
import { getUserByClerkId } from "@/actions/user/getUserByClerk";
import {
  serverErrorResponse,
  successResponse,
  unauthorizedResponse,
  validateApiToken,
  validateInput,
  validationErrorResponse,
} from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * POST /api/exams/[id]/submit
 * Submete respostas de um exame
 *
 * Headers necessários:
 * - Authorization: Bearer <API_TOKEN>
 * - X-User-Id: <clerk_user_id>
 *
 * Path Parameters:
 * - id: ID do exame
 *
 * Body:
 * {
 *   "answers": [
 *     {
 *       "questionId": "string",
 *       "selectedAnswer": "string"
 *     }
 *   ],
 *   "timeSpent": "number (em segundos)"
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
    const { id: examId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Header X-User-Id é obrigatório",
          code: "MISSING_USER_ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!examId) {
      return new Response(
        JSON.stringify({
          error: "ID do exame é obrigatório",
          code: "MISSING_EXAM_ID",
        }),
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
        JSON.stringify({
          error: "Usuário não encontrado",
          code: "USER_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { answers, timeSpent } = body;

    // Validação de entrada
    const validation = validateInput(body, ["answers", "timeSpent"]);
    if (!validation.isValid) {
      return validationErrorResponse(
        validation.errors,
        "SUBMISSION_VALIDATION_ERROR"
      );
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return validationErrorResponse(
        ["answers deve ser um array não vazio"],
        "INVALID_ANSWERS_FORMAT"
      );
    }

    if (typeof timeSpent !== "number" || timeSpent < 0) {
      return validationErrorResponse(
        ["timeSpent deve ser um número positivo"],
        "INVALID_TIME_SPENT"
      );
    }

    // Validar formato das respostas
    for (const answer of answers) {
      if (!answer.questionId || !answer.selectedAnswer) {
        return validationErrorResponse(
          ["Cada resposta deve ter questionId e selectedAnswer"],
          "INVALID_ANSWER_FORMAT"
        );
      }
    }

    // Submeter respostas
    const result = await submitExamAnswers({
      examId,
      userId: user.id,
      answers,
      timeSpent,
    });

    return successResponse({
      message: result.passed ? "Exame aprovado!" : "Exame reprovado",
      result: result,
    });
  } catch (error) {
    console.error("Erro ao submeter exame:", error);
    return serverErrorResponse("Erro ao submeter exame");
  }
}
