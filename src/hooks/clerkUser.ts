import { currentUser, User } from "@clerk/nextjs/server";

export const useClerkUser = async (): Promise<User> => {
  const user = await currentUser();
  return JSON.parse(JSON.stringify(user));
};
