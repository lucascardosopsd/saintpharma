import { NextRequest } from "next/server";

/**
 * Middleware de autenticação para APIs do React Native
 * Verifica se o token de autorização está presente e é válido
 */
export function validateApiToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiToken = process.env.API_TOKEN;

  if (!apiToken) {
    console.error("API_TOKEN não configurado nas variáveis de ambiente");
    return false;
  }

  if (!authHeader) {
    return false;
  }

  // Formato esperado: "Bearer <token>"
  const token = authHeader.replace("Bearer ", "");

  return token === apiToken;
}

/**
 * Resposta padrão para erro de autenticação
 */
export function unauthorizedResponse(message?: string) {
  const errorMessage = message || "Token de autorização inválido ou ausente";

  // Log de segurança
  console.warn(`[SECURITY] Unauthorized access attempt: ${errorMessage}`);

  return new Response(
    JSON.stringify({
      error: errorMessage,
      code: "UNAUTHORIZED",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Resposta padrão para erro interno do servidor
 */
export function serverErrorResponse(
  message: string = "Erro interno do servidor",
  errorCode?: string,
  details?: any
) {
  // Log de erro estruturado
  console.error(`[ERROR] Server error: ${message}`, {
    code: errorCode,
    details,
    timestamp: new Date().toISOString(),
  });

  return new Response(
    JSON.stringify({
      error: message,
      code: errorCode || "INTERNAL_SERVER_ERROR",
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Resposta padrão para sucesso
 */
export function successResponse(data: any, status: number = 200) {
  // Log de sucesso estruturado
  console.log(`[SUCCESS] API response`, {
    status,
    timestamp: new Date().toISOString(),
    dataType: typeof data,
  });

  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Valida se um recurso pertence ao usuário
 */
export function validateResourceOwnership(
  resourceUserId: string,
  requestingUserId: string
): boolean {
  return resourceUserId === requestingUserId;
}

/**
 * Resposta padrão para erro de acesso negado
 */
export function forbiddenResponse(
  message: string = "Acesso negado ao recurso"
) {
  // Log de segurança
  console.warn(`[SECURITY] Forbidden access attempt: ${message}`);

  return new Response(
    JSON.stringify({
      error: message,
      code: "FORBIDDEN",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Log de auditoria para operações críticas
 */
export function logAuditEvent(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: any
) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resourceType,
    resourceId,
    details,
    ip: process.env.NODE_ENV === "production" ? "hidden" : "localhost",
  };

  console.log(`[AUDIT] ${JSON.stringify(auditLog)}`);

  // Em produção, você pode enviar para um serviço de logging como:
  // - Winston
  // - CloudWatch
  // - Datadog
  // - Sentry
}

/**
 * Validação de entrada básica
 */
export function validateInput(
  data: any,
  requiredFields: string[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Campo '${field}' é obrigatório`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitização básica de strings
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove caracteres potencialmente perigosos
    .substring(0, 1000); // Limita tamanho
}

/**
 * Validação de ID (deve ser string não vazia)
 */
export function validateId(id: any): boolean {
  return typeof id === "string" && id.trim().length > 0;
}

/**
 * Resposta padrão para erro de validação
 */
export function validationErrorResponse(
  errors: string[],
  code: string = "VALIDATION_ERROR"
) {
  console.warn(`[VALIDATION] Validation errors: ${errors.join(", ")}`);

  return new Response(
    JSON.stringify({
      error: "Erro de validação",
      code,
      details: errors,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}
