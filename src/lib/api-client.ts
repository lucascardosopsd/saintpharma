/**
 * Cliente utilitário para fazer chamadas internas à API
 * Usa process.env.API_TOKEN automaticamente (variável de servidor, não exposta ao cliente)
 * 
 * IMPORTANTE: Esta função só funciona no servidor (Server Components, Server Actions, API Routes)
 * Para uso no cliente, use Server Actions que chamam esta função internamente
 */

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  userId?: string;
};

type ApiResponse<T = any> = {
  success: boolean;
  data: T;
  timestamp: string;
};

/**
 * Faz uma requisição interna à API usando o token de servidor
 * @param endpoint - Endpoint da API (ex: "/api/exams/eligibility")
 * @param options - Opções da requisição
 * @returns Resposta da API
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    userId,
  } = options;

  const apiToken = process.env.API_TOKEN;

  if (!apiToken) {
    throw new Error(
      "API_TOKEN não configurado nas variáveis de ambiente. Esta função só funciona no servidor."
    );
  }

  // Construir URL completa
  // Em desenvolvimento, usar localhost diretamente para evitar problemas de rede
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
  
  console.log("[apiClient] Fazendo requisição para:", url);

  // Preparar headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiToken}`,
    ...headers,
  };

  // Adicionar X-User-Id se fornecido
  if (userId) {
    requestHeaders["X-User-Id"] = userId;
  }

  // Fazer requisição
  // Next.js 15: fetch não é mais cacheado por padrão (no-store)
  // Para requisições internas de API, não queremos cache, então explicitamente definimos no-store
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    ...(body && { body: JSON.stringify(body) }),
    cache: 'no-store', // Explícito para Next.js 15
  });

  // Verificar se a resposta é OK
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro na requisição: ${response.status} ${response.statusText}`
    );
  }

  // Retornar dados parseados
  const data: ApiResponse<T> = await response.json();
  return data;
}

/**
 * Helper para requisições GET
 */
export async function apiGet<T = any>(
  endpoint: string,
  userId?: string,
  additionalHeaders?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: "GET",
    userId,
    headers: additionalHeaders,
  });
}

/**
 * Helper para requisições POST
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  userId?: string,
  additionalHeaders?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body,
    userId,
    headers: additionalHeaders,
  });
}

/**
 * Helper para requisições PUT
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  userId?: string,
  additionalHeaders?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body,
    userId,
    headers: additionalHeaders,
  });
}

/**
 * Helper para requisições DELETE
 */
export async function apiDelete<T = any>(
  endpoint: string,
  userId?: string,
  additionalHeaders?: Record<string, string>
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: "DELETE",
    userId,
    headers: additionalHeaders,
  });
}

