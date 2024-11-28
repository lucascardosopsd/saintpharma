"use server";

import { revalidatePath } from "next/cache";

export const revalidateRoute = async ({ fullPath }: { fullPath: string }) => {
  revalidatePath(fullPath);
};
