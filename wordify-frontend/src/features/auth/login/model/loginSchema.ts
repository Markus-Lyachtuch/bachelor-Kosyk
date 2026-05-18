import { z } from "zod";
import { passwordSchema } from "features/auth/common";

export const loginSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;
