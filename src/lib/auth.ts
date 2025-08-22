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
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: "Token de autorização inválido ou ausente" }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Resposta padrão para erro interno do servidor
 */
export function serverErrorResponse(message: string = "Erro interno do servidor") {
  return new Response(
    JSON.stringify({ error: message }),
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
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}