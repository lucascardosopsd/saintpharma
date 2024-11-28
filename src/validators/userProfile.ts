import { z } from "zod";

export const UserProfileSchema = z.object({
  firstName: z.string().min(1, "required"),
  lastName: z.string().optional(),
  email: z.string().optional(),
});
