import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Função reutilizável para proteger páginas que requerem autenticação
 * Verifica se o usuário está logado no Clerk e redireciona para a página principal se não estiver
 *
 * @returns Promise<User> - Retorna o usuário autenticado do Clerk
 * @throws Redireciona para "/" se o usuário não estiver autenticado
 */
export async function requireAuth() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  return user;
}

/**
 * Função para verificar se o usuário está autenticado sem redirecionamento
 * Útil para verificações condicionais
 *
 * @returns Promise<User | null> - Retorna o usuário autenticado ou null
 */
export async function getAuthUser() {
  const user = await currentUser();
  return user;
}
