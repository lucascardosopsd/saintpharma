"use server";

import { revalidatePath } from "next/cache";

export const revalidateRoute = async ({ fullPath }: { fullPath: string }) => {
  try {
    revalidatePath(fullPath);
    // Não retornar nada - void function
  } catch (error) {
    // Log mas não propagar erro para não quebrar o fluxo
    console.error(`[revalidateRoute] Erro ao revalidar ${fullPath}:`, error);
  }
};
